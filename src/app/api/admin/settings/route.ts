import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get system settings from database
    console.log('Checking prisma.systemSettings:', typeof prisma.systemSettings);
    
    // Fallback to default settings if database model doesn't exist yet
    if (!prisma.systemSettings) {
      console.log('SystemSettings model not available, returning defaults');
      const defaultSettings = {
        // Company Information
        companyName: 'Work It Out Insurance',
        companyEmail: 'info@workitout.co.nz',
        companyPhone: '+64 9 123 4567',
        companyAddress: '123 Queen Street, Auckland, 1010, New Zealand',
        companyWebsite: 'https://workitout.co.nz',
        companyLogo: '/logo.png',
        
        // Admin Panel Customization
        adminPanelName: 'Work It Out Admin',
        primaryColor: '#146443',
        secondaryColor: '#10B981',
        navbarColor: '#146443',
        buttonColor: '#146443',
        
        // Localization
        language: 'en-NZ',
        timezone: 'Pacific/Auckland',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24',
        currency: 'NZD',
        numberFormat: '1,234.56',
        
        // Appearance
        theme: 'light',
        logoPosition: 'left',
        sidebarCollapsed: false,
        compactMode: false,
        
        // System Preferences
        autoSave: true,
        autoBackup: true,
        sessionTimeout: 480,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        
        // Notifications
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notificationSound: true,
        
        // Privacy & Security
        twoFactorRequired: false,
        passwordComplexity: 'medium',
        dataRetention: 365,
        activityLogging: true,
        ipWhitelist: "[]",
        
        // Performance
        cacheEnabled: true,
        compressionEnabled: true,
        cdnEnabled: false,
        maxFileSize: 10,
        
        // Regional Settings
        country: 'New Zealand',
        region: 'Auckland',
        city: 'Auckland',
        postalCode: '1010'
      };
      
      return NextResponse.json({
        success: true,
        data: defaultSettings
      });
    }
    
    const settings = await prisma.systemSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // If no settings exist, return defaults
    if (!settings) {
      const defaultSettings = {
        // Company Information
        companyName: 'Work It Out Insurance',
        companyEmail: 'info@workitout.co.nz',
        companyPhone: '+64 9 123 4567',
        companyAddress: '123 Queen Street, Auckland, 1010, New Zealand',
        companyWebsite: 'https://workitout.co.nz',
        companyLogo: '/logo.png',
        
        // Admin Panel Customization
        adminPanelName: 'Work It Out Admin',
        primaryColor: '#146443',
        secondaryColor: '#10B981',
        navbarColor: '#146443',
        buttonColor: '#146443',
        
        // Localization
        language: 'en-NZ',
        timezone: 'Pacific/Auckland',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24',
        currency: 'NZD',
        numberFormat: '1,234.56',
        
        // Appearance
        theme: 'light',
        logoPosition: 'left',
        sidebarCollapsed: false,
        compactMode: false,
        
        // System Preferences
        autoSave: true,
        autoBackup: true,
        sessionTimeout: 480,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        
        // Notifications
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notificationSound: true,
        
        // Privacy & Security
        twoFactorRequired: false,
        passwordComplexity: 'medium',
        dataRetention: 365,
        activityLogging: true,
        ipWhitelist: "[]",
        
        // Performance
        cacheEnabled: true,
        compressionEnabled: true,
        cdnEnabled: false,
        maxFileSize: 10,
        
        // Regional Settings
        country: 'New Zealand',
        region: 'Auckland',
        city: 'Auckland',
        postalCode: '1010'
      };
      
      return NextResponse.json({
        success: true,
        data: defaultSettings
      });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings, userId } = body;

    // Check if SystemSettings model is available
    if (!prisma.systemSettings) {
      console.log('SystemSettings model not available for saving');
      return NextResponse.json({
        success: false,
        error: 'System settings database model not available. Please check database setup.'
      }, { status: 500 });
    }

    // Update or create system settings
    const updatedSettings = await prisma.systemSettings.upsert({
      where: { id: settings.id || 'default' },
      update: {
        ...settings,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        ...settings
      }
    });

    // Log the settings change activity
    if (userId) {
      try {
        await prisma.userActivity.create({
          data: {
            userId,
            action: 'update_system_settings',
            category: 'system',
            description: 'Updated system settings',
            metadata: JSON.stringify({
              changedFields: Object.keys(settings),
              timestamp: new Date().toISOString()
            })
          }
        });
      } catch (error) {
        console.warn('Failed to log activity:', error);
        // Continue without logging - don't fail the entire request
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}