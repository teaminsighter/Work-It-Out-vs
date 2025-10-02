import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch platform integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const platforms = await prisma.platformIntegration.findMany({
      where,
      include: {
        _count: {
          select: { events: true }
        }
      },
      orderBy: { lastSync: 'desc' }
    });

    const formattedPlatforms = platforms.map(platform => ({
      id: platform.id.toString(),
      name: platform.name,
      description: platform.description,
      category: platform.category,
      status: platform.status,
      icon: platform.icon,
      lastSync: platform.lastSync?.toISOString(),
      dataPoints: platform.dataPoints || 0,
      apiVersion: platform.apiVersion,
      features: platform.features as string[],
      endpoint: platform.endpoint,
      webhookUrl: platform.webhookUrl,
      totalEvents: platform._count.events
    }));

    return NextResponse.json({ platforms: formattedPlatforms });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}

// POST - Add or connect platform integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      platformId,
      apiKey,
      clientId,
      clientSecret,
      accessToken,
      webhookSecret,
      endpoint,
      features = [],
      testConnection = false
    } = body;

    if (!name || !category || !platformId) {
      return NextResponse.json(
        { error: 'Name, category, and platform ID are required' },
        { status: 400 }
      );
    }

    let connectionStatus = 'disconnected';
    let lastSync = null;
    let dataPoints = 0;

    // Test connection if requested and credentials provided
    if (testConnection && (apiKey || accessToken)) {
      try {
        const testResult = await testPlatformConnection(platformId, {
          apiKey,
          clientId,
          clientSecret,
          accessToken,
          endpoint
        });
        connectionStatus = testResult.success ? 'connected' : 'error';
        if (testResult.success) {
          lastSync = new Date();
          dataPoints = testResult.dataPoints || 0;
        }
      } catch (testError) {
        console.error('Connection test failed:', testError);
        connectionStatus = 'error';
      }
    }

    // Store credentials securely (in production, encrypt these)
    const credentials = {
      ...(apiKey && { apiKey }),
      ...(clientId && { clientId }),
      ...(clientSecret && { clientSecret }),
      ...(accessToken && { accessToken }),
      ...(webhookSecret && { webhookSecret })
    };

    const platform = await prisma.platformIntegration.create({
      data: {
        name,
        description: description || `${name} integration`,
        category,
        platformId,
        status: connectionStatus,
        credentials,
        endpoint,
        features,
        lastSync,
        dataPoints,
        apiVersion: getPlatformApiVersion(platformId),
        icon: getPlatformIcon(platformId),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Platform ${name} ${connectionStatus === 'connected' ? 'connected' : 'added'} successfully`,
      data: {
        id: platform.id.toString(),
        name: platform.name,
        status: platform.status,
        lastSync: platform.lastSync?.toISOString(),
        dataPoints: platform.dataPoints
      }
    });
  } catch (error) {
    console.error('Error adding platform integration:', error);
    return NextResponse.json(
      { error: 'Failed to add platform integration' },
      { status: 500 }
    );
  }
}

// PUT - Update platform integration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Platform ID is required' },
        { status: 400 }
      );
    }

    const platform = await prisma.platformIntegration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      );
    }

    let updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    // Handle specific actions
    if (action === 'sync') {
      try {
        const syncResult = await syncPlatformData(platform.platformId, platform.credentials);
        updateFields.lastSync = new Date();
        updateFields.dataPoints = syncResult.dataPoints || platform.dataPoints;
        updateFields.status = 'connected';
      } catch (syncError) {
        console.error('Platform sync failed:', syncError);
        updateFields.status = 'error';
      }
    } else if (action === 'test') {
      try {
        const testResult = await testPlatformConnection(platform.platformId, platform.credentials);
        updateFields.status = testResult.success ? 'connected' : 'error';
      } catch (testError) {
        console.error('Platform test failed:', testError);
        updateFields.status = 'error';
      }
    }

    const updatedPlatform = await prisma.platformIntegration.update({
      where: { id: parseInt(id) },
      data: updateFields
    });

    return NextResponse.json({
      success: true,
      message: `Platform ${action || 'updated'} successfully`,
      data: {
        id: updatedPlatform.id.toString(),
        status: updatedPlatform.status,
        lastSync: updatedPlatform.lastSync?.toISOString(),
        dataPoints: updatedPlatform.dataPoints
      }
    });
  } catch (error) {
    console.error('Error updating platform integration:', error);
    return NextResponse.json(
      { error: 'Failed to update platform integration' },
      { status: 500 }
    );
  }
}

// Helper functions
async function testPlatformConnection(platformId: string, credentials: any): Promise<{ success: boolean; dataPoints?: number }> {
  switch (platformId) {
    case 'google_analytics':
      return await testGoogleAnalytics(credentials);
    case 'facebook_pixel':
      return await testFacebookPixel(credentials);
    case 'google_ads':
      return await testGoogleAds(credentials);
    case 'salesforce':
      return await testSalesforce(credentials);
    default:
      return { success: false };
  }
}

async function syncPlatformData(platformId: string, credentials: any): Promise<{ dataPoints: number }> {
  switch (platformId) {
    case 'google_analytics':
      return await syncGoogleAnalytics(credentials);
    case 'facebook_pixel':
      return await syncFacebookPixel(credentials);
    default:
      return { dataPoints: 0 };
  }
}

// Platform-specific test functions
async function testGoogleAnalytics(credentials: any): Promise<{ success: boolean; dataPoints?: number }> {
  if (!credentials.accessToken) {
    throw new Error('Google Analytics access token required');
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
          viewId: credentials.viewId || 'ga:XXXXXXXXX', // Would need property ID
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ expression: 'ga:sessions' }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const sessions = data.reports?.[0]?.data?.totals?.[0]?.values?.[0] || 0;
      return { success: true, dataPoints: parseInt(sessions) };
    }
    return { success: false };
  } catch (error) {
    console.error('GA test error:', error);
    return { success: false };
  }
}

async function testFacebookPixel(credentials: any): Promise<{ success: boolean; dataPoints?: number }> {
  if (!credentials.accessToken) {
    throw new Error('Facebook access token required');
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${credentials.accessToken}`);
    return { success: response.ok, dataPoints: 0 };
  } catch (error) {
    console.error('Facebook test error:', error);
    return { success: false };
  }
}

async function testGoogleAds(credentials: any): Promise<{ success: boolean; dataPoints?: number }> {
  if (!credentials.accessToken) {
    throw new Error('Google Ads access token required');
  }

  try {
    const response = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'developer-token': credentials.developerToken || ''
      }
    });
    return { success: response.ok, dataPoints: 0 };
  } catch (error) {
    console.error('Google Ads test error:', error);
    return { success: false };
  }
}

async function testSalesforce(credentials: any): Promise<{ success: boolean; dataPoints?: number }> {
  if (!credentials.accessToken || !credentials.instanceUrl) {
    throw new Error('Salesforce access token and instance URL required');
  }

  try {
    const response = await fetch(`${credentials.instanceUrl}/services/data/v57.0/sobjects/Lead/count/`, {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, dataPoints: data.totalSize || 0 };
    }
    return { success: false };
  } catch (error) {
    console.error('Salesforce test error:', error);
    return { success: false };
  }
}

// Sync functions (simplified versions)
async function syncGoogleAnalytics(credentials: any): Promise<{ dataPoints: number }> {
  // Implement GA data sync
  return { dataPoints: Math.floor(Math.random() * 10000) + 1000 };
}

async function syncFacebookPixel(credentials: any): Promise<{ dataPoints: number }> {
  // Implement Facebook data sync
  return { dataPoints: Math.floor(Math.random() * 5000) + 500 };
}

function getPlatformApiVersion(platformId: string): string {
  const versions: Record<string, string> = {
    'google_analytics': 'v4',
    'facebook_pixel': 'v18.0',
    'google_ads': 'v14',
    'salesforce': 'v57.0',
    'mailchimp': 'v3',
    'zapier': 'v1'
  };
  return versions[platformId] || 'v1';
}

function getPlatformIcon(platformId: string): string {
  const icons: Record<string, string> = {
    'google_analytics': 'BarChart3',
    'facebook_pixel': 'Globe',
    'google_ads': 'Zap',
    'salesforce': 'Database',
    'mailchimp': 'Shield',
    'zapier': 'Activity'
  };
  return icons[platformId] || 'Globe';
}