import { NextResponse } from 'next/server';

// Mock data for Facebook Ads integration
const mockFacebookAdsData = {
  overview: {
    totalSpend: 8750.25,
    results: 234,
    costPerResult: 37.39,
    roas: 3.8,
    changeSpend: 15.2,
    changeResults: 8.5,
    changeCostPerResult: -12.3,
    changeRoas: 22.1
  },
  accounts: [
    {
      id: 'act_123456789',
      name: 'Local Power - Main Account',
      currency: 'USD',
      status: 'active',
      spend_last_30_days: 8750.25,
      results_last_30_days: 234,
      connected: true
    },
    {
      id: 'act_987654321',
      name: 'Local Power - Regional',
      currency: 'USD', 
      status: 'active',
      spend_last_30_days: 3250.75,
      results_last_30_days: 89,
      connected: true
    }
  ],
  events: [
    {
      id: 'event_001',
      name: 'Lead',
      event_type: 'Lead',
      server_side: true,
      browser_side: true,
      events_last_30_days: 156,
      deduplication_rate: 15.2
    },
    {
      id: 'event_002',
      name: 'Purchase',
      event_type: 'Purchase',
      server_side: true,
      browser_side: false,
      events_last_30_days: 78,
      deduplication_rate: 8.7
    },
    {
      id: 'event_003',
      name: 'CompleteRegistration',
      event_type: 'CompleteRegistration',
      server_side: false,
      browser_side: true,
      events_last_30_days: 245,
      deduplication_rate: 22.1
    }
  ],
  capi: {
    serverEvents: 450,
    matchQuality: 87.5,
    deduplicationRate: 15.8
  },
  config: {
    appId: '',
    appSecret: '',
    pixelId: '',
    accessToken: '',
    testEventCode: ''
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return NextResponse.json(mockFacebookAdsData.overview);
      case 'accounts':
        return NextResponse.json(mockFacebookAdsData.accounts);
      case 'events':
        return NextResponse.json(mockFacebookAdsData.events);
      case 'capi':
        return NextResponse.json(mockFacebookAdsData.capi);
      case 'config':
        return NextResponse.json(mockFacebookAdsData.config);
      default:
        return NextResponse.json(mockFacebookAdsData.overview);
    }
  } catch (error) {
    console.error('Facebook Ads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Facebook Ads data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'connect':
        return NextResponse.json({
          success: true,
          message: 'Facebook Ads account connected successfully',
          connected: true
        });
      
      case 'test-connection':
        const { appId, accessToken } = data;
        if (appId && accessToken) {
          return NextResponse.json({
            success: true,
            message: 'Connection test successful',
            connected: true
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Invalid credentials',
            connected: false
          });
        }
      
      case 'save-config':
        return NextResponse.json({
          success: true,
          message: 'Configuration saved successfully'
        });

      case 'test-pixel':
        return NextResponse.json({
          success: true,
          message: 'Test event sent to pixel successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Facebook Ads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
