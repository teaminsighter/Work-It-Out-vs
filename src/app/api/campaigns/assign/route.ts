import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// Assign visitor to campaign variant
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { campaignId, visitorId, sessionId, userAgent, ipAddress, referrer } = data;

    if (!campaignId || !visitorId) {
      return NextResponse.json(
        { error: 'Campaign ID and visitor ID are required' },
        { status: 400 }
      );
    }

    // Check if visitor already has an assignment for this campaign
    const existingAssignment = await prisma.campaignAssignment.findUnique({
      where: {
        campaignId_visitorId: {
          campaignId,
          visitorId
        }
      },
      include: {
        variant: true
      }
    });

    if (existingAssignment) {
      return NextResponse.json({ 
        assignment: existingAssignment,
        variant: existingAssignment.variant
      });
    }

    // Get campaign with variants
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        variants: {
          orderBy: {
            trafficPercentage: 'desc'
          }
        }
      }
    });

    if (!campaign || campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign not found or not active' },
        { status: 404 }
      );
    }

    // Assign variant based on traffic percentages
    const selectedVariant = assignVariant(visitorId, campaign.variants);

    // Create assignment record
    const assignment = await prisma.campaignAssignment.create({
      data: {
        campaignId,
        variantId: selectedVariant.id,
        visitorId,
        sessionId,
        assignmentMethod: 'random',
        ipAddress,
        userAgent,
        referrer
      },
      include: {
        variant: true
      }
    });

    // Update variant visitor count
    await prisma.campaignVariant.update({
      where: { id: selectedVariant.id },
      data: {
        visitors: {
          increment: 1
        }
      }
    });

    // Update campaign total visitors
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalVisitors: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      assignment,
      variant: assignment.variant
    });
  } catch (error) {
    console.error('Error assigning visitor to campaign:', error);
    return NextResponse.json(
      { error: 'Failed to assign visitor to campaign' },
      { status: 500 }
    );
  }
}

// Hash-based variant assignment for consistent distribution
function assignVariant(visitorId: string, variants: any[]) {
  // Create a simple hash from visitor ID
  let hash = 0;
  for (let i = 0; i < visitorId.length; i++) {
    const char = visitorId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get positive percentage (0-99)
  const percentage = Math.abs(hash) % 100;
  
  // Assign based on cumulative percentages
  let cumulativePercentage = 0;
  for (const variant of variants) {
    cumulativePercentage += variant.trafficPercentage;
    if (percentage < cumulativePercentage) {
      return variant;
    }
  }
  
  // Fallback to first variant
  return variants[0];
}