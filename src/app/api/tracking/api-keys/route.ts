import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Encryption key - in production, this should be stored securely
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'your-32-character-secret-key-here!';

// GET - Fetch API configurations (with masked sensitive data)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    const where = platform ? { platform } : {};
    
    const configs = await prisma.aPIConfiguration.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    const formattedConfigs = configs.map(config => ({
      id: config.id.toString(),
      platform: config.platform,
      clientId: config.clientId,
      clientSecret: maskSecret(config.clientSecret),
      accessToken: maskSecret(config.accessToken),
      refreshToken: maskSecret(config.refreshToken),
      webhookSecret: maskSecret(config.webhookSecret),
      additionalSettings: config.additionalSettings,
      testMode: config.testMode || false,
      isActive: config.isActive,
      lastUsed: config.lastUsed?.toISOString(),
      expiresAt: config.expiresAt?.toISOString(),
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString()
    }));

    return NextResponse.json({ configurations: formattedConfigs });
  } catch (error) {
    console.error('Error fetching API configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API configurations' },
      { status: 500 }
    );
  }
}

// POST - Create or update API configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platform,
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
      webhookSecret,
      additionalSettings = {},
      testMode = false,
      testConnection = false
    } = body;

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    // Test connection if requested
    let connectionTest = null;
    if (testConnection) {
      connectionTest = await testPlatformConnection(platform, {
        clientId,
        clientSecret,
        accessToken,
        refreshToken,
        webhookSecret,
        ...additionalSettings
      });
    }

    // Encrypt sensitive data
    const encryptedData = {
      clientSecret: clientSecret ? encrypt(clientSecret) : null,
      accessToken: accessToken ? encrypt(accessToken) : null,
      refreshToken: refreshToken ? encrypt(refreshToken) : null,
      webhookSecret: webhookSecret ? encrypt(webhookSecret) : null
    };

    // Check if configuration already exists
    const existingConfig = await prisma.aPIConfiguration.findUnique({
      where: { platform }
    });

    let config;
    if (existingConfig) {
      config = await prisma.aPIConfiguration.update({
        where: { platform },
        data: {
          clientId,
          clientSecret: encryptedData.clientSecret,
          accessToken: encryptedData.accessToken,
          refreshToken: encryptedData.refreshToken,
          webhookSecret: encryptedData.webhookSecret,
          additionalSettings,
          testMode,
          isActive: connectionTest?.success ?? true,
          lastUsed: connectionTest?.success ? new Date() : undefined,
          expiresAt: calculateExpiryDate(platform, additionalSettings),
          updatedAt: new Date()
        }
      });
    } else {
      config = await prisma.aPIConfiguration.create({
        data: {
          platform,
          clientId,
          clientSecret: encryptedData.clientSecret,
          accessToken: encryptedData.accessToken,
          refreshToken: encryptedData.refreshToken,
          webhookSecret: encryptedData.webhookSecret,
          additionalSettings,
          testMode,
          isActive: connectionTest?.success ?? true,
          lastUsed: connectionTest?.success ? new Date() : undefined,
          expiresAt: calculateExpiryDate(platform, additionalSettings),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `API configuration for ${platform} ${existingConfig ? 'updated' : 'created'} successfully`,
      data: {
        id: config.id.toString(),
        platform: config.platform,
        isActive: config.isActive,
        testConnection: connectionTest
      }
    });
  } catch (error) {
    console.error('Error saving API configuration:', error);
    return NextResponse.json(
      { error: 'Failed to save API configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update specific API configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    const config = await prisma.aPIConfiguration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    let updateFields: any = { updatedAt: new Date() };

    if (action === 'test') {
      // Test the connection with current credentials
      const decryptedCreds = {
        clientId: config.clientId,
        clientSecret: config.clientSecret ? decrypt(config.clientSecret) : null,
        accessToken: config.accessToken ? decrypt(config.accessToken) : null,
        refreshToken: config.refreshToken ? decrypt(config.refreshToken) : null,
        webhookSecret: config.webhookSecret ? decrypt(config.webhookSecret) : null,
        ...config.additionalSettings
      };

      const testResult = await testPlatformConnection(config.platform, decryptedCreds);
      updateFields.isActive = testResult.success;
      updateFields.lastUsed = testResult.success ? new Date() : config.lastUsed;

      const updatedConfig = await prisma.aPIConfiguration.update({
        where: { id: parseInt(id) },
        data: updateFields
      });

      return NextResponse.json({
        success: true,
        message: `Connection test ${testResult.success ? 'successful' : 'failed'}`,
        data: {
          testResult,
          isActive: updatedConfig.isActive
        }
      });
    } else if (action === 'refresh_token') {
      // Refresh access token if possible
      const refreshResult = await refreshAccessToken(config.platform, config);
      if (refreshResult.success) {
        updateFields.accessToken = encrypt(refreshResult.accessToken);
        updateFields.expiresAt = refreshResult.expiresAt;
        updateFields.isActive = true;
      }

      const updatedConfig = await prisma.aPIConfiguration.update({
        where: { id: parseInt(id) },
        data: updateFields
      });

      return NextResponse.json({
        success: refreshResult.success,
        message: refreshResult.success ? 'Token refreshed successfully' : 'Token refresh failed',
        data: {
          isActive: updatedConfig.isActive,
          expiresAt: updatedConfig.expiresAt?.toISOString()
        }
      });
    } else {
      // Regular update
      if (updateData.clientSecret) updateFields.clientSecret = encrypt(updateData.clientSecret);
      if (updateData.accessToken) updateFields.accessToken = encrypt(updateData.accessToken);
      if (updateData.refreshToken) updateFields.refreshToken = encrypt(updateData.refreshToken);
      if (updateData.webhookSecret) updateFields.webhookSecret = encrypt(updateData.webhookSecret);
      
      // Copy non-sensitive fields
      ['clientId', 'additionalSettings', 'testMode', 'isActive'].forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      });

      const updatedConfig = await prisma.aPIConfiguration.update({
        where: { id: parseInt(id) },
        data: updateFields
      });

      return NextResponse.json({
        success: true,
        message: 'Configuration updated successfully',
        data: {
          id: updatedConfig.id.toString(),
          platform: updatedConfig.platform,
          isActive: updatedConfig.isActive
        }
      });
    }
  } catch (error) {
    console.error('Error updating API configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update API configuration' },
      { status: 500 }
    );
  }
}

// DELETE - Delete API configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    await prisma.aPIConfiguration.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'API configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete API configuration' },
      { status: 500 }
    );
  }
}

// Helper functions
function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function maskSecret(secret: string | null): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return secret.substring(0, 4) + '••••••••••••••••';
}

function calculateExpiryDate(platform: string, settings: any): Date | null {
  // Platform-specific token expiry logic
  switch (platform) {
    case 'Google Ads':
    case 'Google Analytics':
      return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    case 'Facebook':
      return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
    default:
      return null; // No expiry
  }
}

async function testPlatformConnection(platform: string, credentials: any): Promise<{ success: boolean; error?: string }> {
  try {
    switch (platform) {
      case 'Google Analytics':
        return await testGoogleAnalytics(credentials);
      case 'Google Ads':
        return await testGoogleAds(credentials);
      case 'Facebook':
        return await testFacebook(credentials);
      case 'TikTok':
        return await testTikTok(credentials);
      case 'Salesforce':
        return await testSalesforce(credentials);
      default:
        return { success: false, error: 'Unknown platform' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function refreshAccessToken(platform: string, config: any): Promise<{ success: boolean; accessToken?: string; expiresAt?: Date }> {
  // Platform-specific token refresh logic
  switch (platform) {
    case 'Google Analytics':
    case 'Google Ads':
      return await refreshGoogleToken(config);
    case 'Facebook':
      return await refreshFacebookToken(config);
    default:
      return { success: false };
  }
}

// Platform-specific test functions
async function testGoogleAnalytics(credentials: any): Promise<{ success: boolean; error?: string }> {
  if (!credentials.accessToken) {
    return { success: false, error: 'Access token required' };
  }

  try {
    const response = await fetch('https://analyticsreporting.googleapis.com/v4/reports:batchGet', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportRequests: [{
          viewId: credentials.viewId || 'ga:123456789',
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ expression: 'ga:sessions' }]
        }]
      })
    });

    return { success: response.ok };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

async function testGoogleAds(credentials: any): Promise<{ success: boolean; error?: string }> {
  if (!credentials.accessToken || !credentials.developerToken) {
    return { success: false, error: 'Access token and developer token required' };
  }

  try {
    const response = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'developer-token': credentials.developerToken
      }
    });

    return { success: response.ok };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

async function testFacebook(credentials: any): Promise<{ success: boolean; error?: string }> {
  if (!credentials.accessToken) {
    return { success: false, error: 'Access token required' };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${credentials.accessToken}`);
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

async function testTikTok(credentials: any): Promise<{ success: boolean; error?: string }> {
  if (!credentials.accessToken) {
    return { success: false, error: 'Access token required' };
  }

  try {
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/advertiser/info/', {
      headers: {
        'Access-Token': credentials.accessToken
      }
    });

    return { success: response.ok };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

async function testSalesforce(credentials: any): Promise<{ success: boolean; error?: string }> {
  if (!credentials.accessToken || !credentials.instanceUrl) {
    return { success: false, error: 'Access token and instance URL required' };
  }

  try {
    const response = await fetch(`${credentials.instanceUrl}/services/data/v57.0/sobjects/`, {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`
      }
    });

    return { success: response.ok };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

// Token refresh functions
async function refreshGoogleToken(config: any): Promise<{ success: boolean; accessToken?: string; expiresAt?: Date }> {
  if (!config.refreshToken) {
    return { success: false };
  }

  try {
    const refreshToken = decrypt(config.refreshToken);
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: decrypt(config.clientSecret)
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      };
    }

    return { success: false };
  } catch (error) {
    return { success: false };
  }
}

async function refreshFacebookToken(config: any): Promise<{ success: boolean; accessToken?: string; expiresAt?: Date }> {
  // Facebook tokens typically have long-lived expiry
  return { success: false };
}