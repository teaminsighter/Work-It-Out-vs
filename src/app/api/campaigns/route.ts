import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        variants: true,
        _count: {
          select: {
            assignments: true,
            analytics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.campaignUrl || !data.variants || data.variants.length < 2) {
      return NextResponse.json(
        { error: 'Missing required fields: name, campaignUrl, and at least 2 variants required' },
        { status: 400 }
      );
    }

    // Validate traffic percentages add up to 100%
    const totalPercentage = data.variants.reduce((sum: number, variant: any) => sum + variant.trafficPercentage, 0);
    if (totalPercentage !== 100) {
      return NextResponse.json(
        { error: 'Traffic percentages must add up to 100%' },
        { status: 400 }
      );
    }

    // Check if campaign URL already exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { campaignUrl: data.campaignUrl }
    });

    if (existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign URL already exists' },
        { status: 400 }
      );
    }

    // Create campaign with variants
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        campaignUrl: data.campaignUrl,
        conversionGoal: data.conversionGoal || 'form_submission',
        createdBy: 'admin', // TODO: Get from session
        variants: {
          create: data.variants.map((variant: any) => ({
            name: variant.name,
            landingPageId: variant.landingPageId,
            landingPageSlug: variant.landingPageSlug || variant.urlPath,
            trafficPercentage: variant.trafficPercentage,
            isControl: variant.isControl || false
          }))
        }
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      campaign 
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');
    const action = searchParams.get('action'); // start, pause, stop
    
    if (!campaignId || !action) {
      return NextResponse.json(
        { error: 'Missing campaign ID or action' },
        { status: 400 }
      );
    }

    // Map actions to status
    let newStatus: string;
    switch (action) {
      case 'start':
        newStatus = 'ACTIVE';
        break;
      case 'pause':
        newStatus = 'PAUSED';
        break;
      case 'stop':
        newStatus = 'COMPLETED';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update campaign status in database
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { 
        status: newStatus,
        startDate: action === 'start' ? new Date() : undefined
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Campaign ${action}ed successfully`,
      campaign
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// Track campaign visits and conversions
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { campaignId, variantId, event } = data; // event: 'visit' | 'conversion'
    
    if (!campaignId || !variantId || !event) {
      return NextResponse.json(
        { error: 'Missing required tracking data' },
        { status: 400 }
      );
    }

    // For now, just log the tracking event
    // In production, this would update the campaign analytics in the database
    console.log('Tracking event:', { campaignId, variantId, event, timestamp: new Date() });

    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking campaign event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}