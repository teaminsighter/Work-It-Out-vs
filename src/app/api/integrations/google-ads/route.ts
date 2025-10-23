import { NextResponse } from 'next/server';

// Mock data for Google Ads integration
const mockGoogleAdsData = {
  overview: {
    metrics: {
      totalSpend: 15420.50,
      totalConversions: 127,
      costPerConversion: 121.42,
      conversionRate: 3.8,
      impressions: 125000,
      clicks: 3342,
      ctr: 2.67,
      roas: 4.2,
      changeSpend: 12.5,
      changeConversions: -3.2,
      changeCostPerConversion: 8.1,
      changeConversionRate: -0.5,
      changeRoas: 22.1
    }
  },
  accounts: [
    {
      id: '123-456-7890',
      name: 'Main Account - Local Power',
      currency: 'USD',
      status: 'active',
      spend_last_30_days: 15420.50,
      conversions_last_30_days: 127,
      connected: true
    },
    {
      id: '987-654-3210', 
      name: 'Secondary Account - Regional',
      currency: 'USD',
      status: 'paused',
      spend_last_30_days: 5230.25,
      conversions_last_30_days: 43,
      connected: true
    }
  ],
  conversions: [
    {
      id: 'conv_001',
      name: 'Lead Form Submission',
      type: 'lead',
      value: 50.00,
      count_last_30_days: 85,
      status: 'active'
    },
    {
      id: 'conv_002',
      name: 'Phone Call',
      type: 'call',
      value: 75.00,
      count_last_30_days: 42,
      status: 'active'
    },
    {
      id: 'conv_003',
      name: 'Quote Request',
      type: 'signup',
      value: 40.00,
      count_last_30_days: 67,
      status: 'active'
    }
  ],
  config: {
    connected: false,
    customerId: '',
    developerToken: '',
    clientId: '',
    clientSecret: '',
    refreshToken: ''
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return NextResponse.json(mockGoogleAdsData.overview);
      case 'accounts':
        return NextResponse.json(mockGoogleAdsData.accounts);
      case 'conversions':
        return NextResponse.json(mockGoogleAdsData.conversions);
      case 'config':
        return NextResponse.json(mockGoogleAdsData.config);
      default:
        return NextResponse.json(mockGoogleAdsData.overview);
    }
  } catch (error) {
    console.error('Google Ads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Google Ads data' },
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
          message: 'Google Ads account connected successfully',
          connected: true
        });
      
      case 'test-connection':
        const { customerId, developerToken } = data;
        if (customerId && developerToken) {
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

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Google Ads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
