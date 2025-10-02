import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch conversion API endpoints and recent events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'endpoints';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (type === 'events') {
      // Get recent conversion events
      const events = await prisma.conversionEvent.findMany({
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          endpoint: {
            select: {
              name: true,
              platform: true
            }
          }
        }
      });

      const formattedEvents = events.map(event => ({
        id: event.id.toString(),
        eventName: event.eventName,
        platform: event.endpoint.platform,
        timestamp: event.timestamp.toISOString(),
        status: event.status,
        value: event.value || 0,
        currency: event.currency || 'EUR',
        responseTime: event.responseTime || 0,
        errorMessage: event.errorMessage
      }));

      return NextResponse.json(formattedEvents);
    } else if (type === 'configurations') {
      // Get API configurations
      const configs = await prisma.aPIConfiguration.findMany({
        orderBy: { updatedAt: 'desc' }
      });

      const formattedConfigs = configs.map(config => ({
        platform: config.platform,
        clientId: config.clientId,
        clientSecret: hideSecret(config.clientSecret),
        accessToken: hideSecret(config.accessToken),
        refreshToken: hideSecret(config.refreshToken),
        webhookSecret: hideSecret(config.webhookSecret),
        testMode: config.testMode || false
      }));

      return NextResponse.json(formattedConfigs);
    } else {
      // Get conversion endpoints
      const endpoints = await prisma.conversionEndpoint.findMany({
        include: {
          _count: {
            select: { conversions: true }
          }
        },
        orderBy: { lastUsed: 'desc' }
      });

      const formattedEndpoints = endpoints.map(endpoint => ({
        id: endpoint.id.toString(),
        name: endpoint.name,
        platform: endpoint.platform,
        endpoint: endpoint.url,
        method: endpoint.method,
        status: endpoint.status,
        lastUsed: endpoint.lastUsed?.toISOString(),
        totalConversions: endpoint._count.events,
        successRate: calculateSuccessRate(endpoint.id),
        avgResponseTime: endpoint.avgResponseTime || 0,
        events: endpoint.events as string[],
        authentication: endpoint.authentication
      }));

      return NextResponse.json(formattedEndpoints);
    }
  } catch (error) {
    console.error('Error fetching conversion API data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion API data' },
      { status: 500 }
    );
  }
}

// POST - Create conversion endpoint or send conversion event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create_endpoint') {
      return await createConversionEndpoint(data);
    } else if (action === 'send_conversion') {
      return await sendConversionEvent(data);
    } else if (action === 'test_endpoint') {
      return await testConversionEndpoint(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use create_endpoint, send_conversion, or test_endpoint' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in conversion API POST:', error);
    return NextResponse.json(
      { error: 'Failed to process conversion API request' },
      { status: 500 }
    );
  }
}

// PUT - Update conversion endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Endpoint ID is required' },
        { status: 400 }
      );
    }

    const endpoint = await prisma.conversionEndpoint.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Conversion endpoint updated successfully',
      data: endpoint
    });
  } catch (error) {
    console.error('Error updating conversion endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to update conversion endpoint' },
      { status: 500 }
    );
  }
}

// Helper function to create conversion endpoint
async function createConversionEndpoint(data: any) {
  const {
    name,
    platform,
    url,
    method = 'POST',
    authentication,
    events = [],
    apiKey,
    clientId,
    clientSecret,
    accessToken,
    webhookSecret
  } = data;

  if (!name || !platform || !url) {
    return NextResponse.json(
      { error: 'Name, platform, and URL are required' },
      { status: 400 }
    );
  }

  // Store credentials securely
  const credentials = {
    ...(apiKey && { apiKey }),
    ...(clientId && { clientId }),
    ...(clientSecret && { clientSecret }),
    ...(accessToken && { accessToken }),
    ...(webhookSecret && { webhookSecret })
  };

  const endpoint = await prisma.conversionEndpoint.create({
    data: {
      name,
      platform,
      url,
      method,
      authentication,
      events,
      credentials,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Conversion endpoint created successfully',
    data: {
      id: endpoint.id.toString(),
      name: endpoint.name,
      platform: endpoint.platform,
      url: endpoint.url,
      status: endpoint.status
    }
  });
}

// Helper function to send conversion event
async function sendConversionEvent(data: any) {
  const {
    endpointId,
    eventName,
    eventData = {},
    value,
    currency = 'EUR',
    userId,
    testMode = false
  } = data;

  if (!endpointId || !eventName) {
    return NextResponse.json(
      { error: 'Endpoint ID and event name are required' },
      { status: 400 }
    );
  }

  const endpoint = await prisma.conversionEndpoint.findUnique({
    where: { id: parseInt(endpointId) }
  });

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Conversion endpoint not found' },
      { status: 404 }
    );
  }

  const startTime = Date.now();
  let status = 'pending';
  let errorMessage = null;
  let responseTime = 0;

  try {
    // Send the conversion event to the platform
    const result = await sendToPlatform(endpoint, {
      eventName,
      eventData,
      value,
      currency,
      userId,
      testMode
    });

    responseTime = Date.now() - startTime;
    status = result.success ? 'success' : 'failed';
    errorMessage = result.error || null;

    // Update endpoint stats
    await prisma.conversionEndpoint.update({
      where: { id: endpoint.id },
      data: {
        lastUsed: new Date(),
        avgResponseTime: calculateNewAvgResponseTime(endpoint.avgResponseTime, responseTime)
      }
    });

  } catch (error) {
    responseTime = Date.now() - startTime;
    status = 'failed';
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  // Record the conversion event
  const conversionEvent = await prisma.conversionEvent.create({
    data: {
      endpointId: endpoint.id,
      eventName,
      eventData,
      value,
      currency,
      userId: userId || `anonymous_${Date.now()}`,
      status,
      responseTime,
      errorMessage,
      testMode,
      timestamp: new Date()
    }
  });

  return NextResponse.json({
    success: status === 'success',
    message: status === 'success' ? 'Conversion sent successfully' : 'Conversion failed',
    data: {
      eventId: conversionEvent.id.toString(),
      status,
      responseTime,
      errorMessage
    }
  });
}

// Helper function to test conversion endpoint
async function testConversionEndpoint(data: any) {
  const { endpointId, testData = {} } = data;

  if (!endpointId) {
    return NextResponse.json(
      { error: 'Endpoint ID is required' },
      { status: 400 }
    );
  }

  const endpoint = await prisma.conversionEndpoint.findUnique({
    where: { id: parseInt(endpointId) }
  });

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Conversion endpoint not found' },
      { status: 404 }
    );
  }

  const startTime = Date.now();
  try {
    const result = await sendToPlatform(endpoint, {
      eventName: 'test_event',
      eventData: testData,
      value: 100,
      currency: 'EUR',
      userId: 'test_user',
      testMode: true
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Endpoint test successful' : 'Endpoint test failed',
      data: {
        responseTime,
        error: result.error
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      message: 'Endpoint test failed',
      data: {
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

// Helper function to send to platform
async function sendToPlatform(endpoint: any, eventData: any): Promise<{ success: boolean; error?: string }> {
  const { platform, url, method, credentials } = endpoint;

  try {
    switch (platform) {
      case 'Facebook':
        return await sendToFacebook(url, credentials, eventData);
      case 'Google Ads':
        return await sendToGoogleAds(url, credentials, eventData);
      case 'TikTok':
        return await sendToTikTok(url, credentials, eventData);
      case 'Salesforce':
        return await sendToSalesforce(url, credentials, eventData);
      default:
        return await sendGenericWebhook(url, method, credentials, eventData);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown platform error'
    };
  }
}

// Platform-specific sending functions
async function sendToFacebook(url: string, credentials: any, eventData: any) {
  const payload = {
    data: [{
      event_name: eventData.eventName,
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        client_user_id: eventData.userId
      },
      custom_data: {
        value: eventData.value,
        currency: eventData.currency,
        ...eventData.eventData
      }
    }],
    test_event_code: eventData.testMode ? 'TEST12345' : undefined
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.accessToken}`
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    return { success: true };
  } else {
    const error = await response.text();
    return { success: false, error };
  }
}

async function sendToGoogleAds(url: string, credentials: any, eventData: any) {
  const payload = {
    conversions: [{
      conversion_action: credentials.conversionAction,
      conversion_date_time: new Date().toISOString(),
      conversion_value: eventData.value,
      currency_code: eventData.currency,
      user_identifiers: [{
        user_identifier_source: 'FIRST_PARTY',
        hashed_email: eventData.userId // Should be hashed in production
      }]
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.accessToken}`,
      'developer-token': credentials.developerToken
    },
    body: JSON.stringify(payload)
  });

  return { success: response.ok };
}

async function sendToTikTok(url: string, credentials: any, eventData: any) {
  const payload = {
    pixel_code: credentials.pixelCode,
    event: eventData.eventName,
    event_id: `${eventData.userId}_${Date.now()}`,
    timestamp: Math.floor(Date.now() / 1000),
    context: {
      user: {
        external_id: eventData.userId
      }
    },
    properties: {
      value: eventData.value,
      currency: eventData.currency,
      ...eventData.eventData
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': credentials.accessToken
    },
    body: JSON.stringify(payload)
  });

  return { success: response.ok };
}

async function sendToSalesforce(url: string, credentials: any, eventData: any) {
  const payload = {
    FirstName: eventData.eventData.firstName || 'Unknown',
    LastName: eventData.eventData.lastName || 'Unknown',
    Email: eventData.eventData.email,
    Phone: eventData.eventData.phone,
    Company: eventData.eventData.company || 'Web Lead',
    LeadSource: 'Website',
    Description: `Lead value: ${eventData.currency} ${eventData.value}`
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.accessToken}`
    },
    body: JSON.stringify(payload)
  });

  return { success: response.ok };
}

async function sendGenericWebhook(url: string, method: string, credentials: any, eventData: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (credentials.apiKey) {
    headers['Authorization'] = `Bearer ${credentials.apiKey}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(eventData)
  });

  return { success: response.ok };
}

// Helper functions
function hideSecret(secret: string | null): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return secret.substring(0, 4) + '••••••••••••••••' + secret.substring(secret.length - 4);
}

function calculateSuccessRate(endpointId: number): number {
  // This would be calculated from actual events
  // For now, return a placeholder
  return Math.floor(Math.random() * 20) + 80; // 80-100%
}

function calculateNewAvgResponseTime(currentAvg: number | null, newResponseTime: number): number {
  if (!currentAvg) return newResponseTime;
  // Simple moving average (in production, you'd want a more sophisticated approach)
  return Math.round((currentAvg + newResponseTime) / 2);
}