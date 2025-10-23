import { NextResponse } from 'next/server';

// Mock data for GA4 integration
const mockGA4Data = {
  overview: {
    totalUsers: 15670,
    sessions: 24567,
    conversions: 892,
    revenue: 45250.75,
    changeUsers: 12.8,
    changeSessions: 18.5,
    changeConversions: 25.3,
    changeRevenue: 32.1
  },
  properties: [
    {
      id: 'GA_MEASUREMENT_ID',
      name: 'Local Power - Main Website',
      measurementId: 'G-XXXXXXXXXX',
      dataStreamId: '123456789',
      status: 'active',
      connected: true
    }
  ],
  events: [
    {
      eventName: 'purchase',
      eventCount: 156,
      eventValue: 28450.25,
      conversionRate: 2.8,
      status: 'active'
    },
    {
      eventName: 'generate_lead', 
      eventCount: 324,
      eventValue: 16200.00,
      conversionRate: 5.2,
      status: 'active'
    },
    {
      eventName: 'begin_checkout',
      eventCount: 567,
      eventValue: 0,
      conversionRate: 8.9,
      status: 'active'
    },
    {
      eventName: 'add_to_cart',
      eventCount: 1245,
      eventValue: 0,
      conversionRate: 15.6,
      status: 'active'
    }
  ],
  ecommerce: {
    purchaseEvents: 156,
    purchaseRevenue: 28450.25,
    addToCartEvents: 1245,
    addToCartConversionRate: 15.6,
    beginCheckoutEvents: 567,
    checkoutCompletionRate: 27.5
  },
  config: {
    measurementId: '',
    apiSecret: '',
    apiKey: '',
    isActive: false
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return NextResponse.json(mockGA4Data.overview);
      case 'properties':
        return NextResponse.json(mockGA4Data.properties);
      case 'events':
        return NextResponse.json(mockGA4Data.events);
      case 'ecommerce':
        return NextResponse.json(mockGA4Data.ecommerce);
      case 'config':
        return NextResponse.json(mockGA4Data.config);
      default:
        return NextResponse.json(mockGA4Data.overview);
    }
  } catch (error) {
    console.error('GA4 API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GA4 data' },
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
          message: 'GA4 property connected successfully',
          connected: true
        });
      
      case 'test-connection':
        const { measurementId, apiSecret } = data;
        if (measurementId && apiSecret) {
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

      case 'create-event':
        return NextResponse.json({
          success: true,
          message: 'Custom event created successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GA4 API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
