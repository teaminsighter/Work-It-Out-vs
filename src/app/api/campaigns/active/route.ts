import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get active campaign by URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignUrl = searchParams.get('url');

    if (!campaignUrl) {
      return NextResponse.json(
        { error: 'Campaign URL is required' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        campaignUrl,
        status: 'ACTIVE'
      },
      include: {
        variants: {
          orderBy: {
            trafficPercentage: 'desc'
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'No active campaign found for this URL' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching active campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}