import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all API configurations grouped by platform
    const configs = await prisma.aPIConfiguration.findMany({
      orderBy: { platform: 'asc' }
    });

    // Group configurations by platform
    const configsByPlatform: Record<string, any> = {};
    
    configs.forEach(config => {
      configsByPlatform[config.platform] = {
        id: config.id,
        clientId: config.clientId || '',
        clientSecret: config.clientSecret || '',
        accessToken: config.accessToken || '',
        refreshToken: config.refreshToken || '',
        webhookSecret: config.webhookSecret || '',
        developerToken: config.developerToken || '',
        oauthClientId: config.oauthClientId || '',
        accountName: config.accountName || '',
        additionalSettings: config.additionalSettings ? JSON.parse(config.additionalSettings) : {},
        testMode: config.testMode,
        isActive: config.isActive,
        lastUsed: config.lastUsed,
        expiresAt: config.expiresAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      };
    });

    // Ensure we have default structures for expected platforms
    const platforms = ['google_ads', 'facebook', 'ga4', 'twilio', 'email', 'solar_api'];
    
    platforms.forEach(platform => {
      if (!configsByPlatform[platform]) {
        configsByPlatform[platform] = {
          clientId: '',
          clientSecret: '',
          accessToken: '',
          refreshToken: '',
          webhookSecret: '',
          developerToken: '',
          oauthClientId: '',
          accountName: '',
          additionalSettings: {},
          testMode: false,
          isActive: true
        };
      }
    });

    // Transform to match the component's expected structure
    const apiSettings = {
      google_ads: {
        client_id: configsByPlatform.google_ads.clientId,
        client_secret: configsByPlatform.google_ads.clientSecret,
        developer_token: configsByPlatform.google_ads.developerToken,
        refresh_token: configsByPlatform.google_ads.refreshToken,
        customer_id: configsByPlatform.google_ads.additionalSettings?.customer_id || ''
      },
      facebook: {
        app_id: configsByPlatform.facebook.clientId,
        app_secret: configsByPlatform.facebook.clientSecret,
        access_token: configsByPlatform.facebook.accessToken,
        pixel_id: configsByPlatform.facebook.additionalSettings?.pixel_id || ''
      },
      ga4: {
        measurement_id: configsByPlatform.ga4.additionalSettings?.measurement_id || '',
        api_secret: configsByPlatform.ga4.clientSecret,
        property_id: configsByPlatform.ga4.additionalSettings?.property_id || ''
      },
      twilio: {
        account_sid: configsByPlatform.twilio.clientId,
        auth_token: configsByPlatform.twilio.clientSecret,
        phone_number: configsByPlatform.twilio.additionalSettings?.phone_number || ''
      },
      email: {
        smtp_host: configsByPlatform.email.additionalSettings?.smtp_host || '',
        smtp_port: configsByPlatform.email.additionalSettings?.smtp_port || '',
        smtp_user: configsByPlatform.email.clientId,
        smtp_password: configsByPlatform.email.clientSecret,
        from_email: configsByPlatform.email.additionalSettings?.from_email || ''
      },
      solar_api: {
        weather_api_key: configsByPlatform.solar_api.clientSecret,
        solar_irradiance_api: configsByPlatform.solar_api.additionalSettings?.solar_irradiance_api || '',
        electricity_prices_api: configsByPlatform.solar_api.additionalSettings?.electricity_prices_api || ''
      }
    };

    return NextResponse.json({
      success: true,
      data: apiSettings
    });
  } catch (error) {
    console.error('Get API config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch API configuration'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, settings, userId } = body;

    // Transform settings based on platform
    let configData: any = {
      platform,
      isActive: true,
      testMode: false
    };

    switch (platform) {
      case 'google_ads':
        configData = {
          ...configData,
          clientId: settings.client_id,
          clientSecret: settings.client_secret,
          developerToken: settings.developer_token,
          refreshToken: settings.refresh_token,
          additionalSettings: JSON.stringify({ customer_id: settings.customer_id })
        };
        break;
      case 'facebook':
        configData = {
          ...configData,
          clientId: settings.app_id,
          clientSecret: settings.app_secret,
          accessToken: settings.access_token,
          additionalSettings: JSON.stringify({ pixel_id: settings.pixel_id })
        };
        break;
      case 'ga4':
        configData = {
          ...configData,
          clientSecret: settings.api_secret,
          additionalSettings: JSON.stringify({
            measurement_id: settings.measurement_id,
            property_id: settings.property_id
          })
        };
        break;
      case 'twilio':
        configData = {
          ...configData,
          clientId: settings.account_sid,
          clientSecret: settings.auth_token,
          additionalSettings: JSON.stringify({ phone_number: settings.phone_number })
        };
        break;
      case 'email':
        configData = {
          ...configData,
          clientId: settings.smtp_user,
          clientSecret: settings.smtp_password,
          additionalSettings: JSON.stringify({
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            from_email: settings.from_email
          })
        };
        break;
      case 'solar_api':
        configData = {
          ...configData,
          clientSecret: settings.weather_api_key,
          additionalSettings: JSON.stringify({
            solar_irradiance_api: settings.solar_irradiance_api,
            electricity_prices_api: settings.electricity_prices_api
          })
        };
        break;
    }

    // Update or create API configuration
    const updatedConfig = await prisma.aPIConfiguration.upsert({
      where: { 
        platform_clientId: { 
          platform, 
          clientId: configData.clientId || 'default' 
        } 
      },
      update: {
        ...configData,
        lastUsed: new Date(),
        updatedAt: new Date()
      },
      create: {
        ...configData,
        clientId: configData.clientId || 'default'
      }
    });

    // Log the API config change
    if (userId) {
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'update_api_configuration',
          category: 'system',
          description: `Updated ${platform} API configuration`,
          metadata: JSON.stringify({
            platform,
            timestamp: new Date().toISOString()
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${platform} API configuration updated successfully`,
      data: updatedConfig
    });
  } catch (error) {
    console.error('Update API config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update API configuration'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}