import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Track campaign conversions
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { campaignId, visitorId, conversionValue, metadata } = data;

    if (!campaignId || !visitorId) {
      return NextResponse.json(
        { error: 'Campaign ID and visitor ID are required' },
        { status: 400 }
      );
    }

    // Find the assignment
    const assignment = await prisma.campaignAssignment.findUnique({
      where: {
        campaignId_visitorId: {
          campaignId,
          visitorId
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'No assignment found for this visitor and campaign' },
        { status: 404 }
      );
    }

    // Update assignment with conversion
    await prisma.campaignAssignment.update({
      where: { id: assignment.id },
      data: {
        hasConverted: true,
        convertedAt: new Date(),
        conversionValue: conversionValue || 1
      }
    });

    // Update variant conversion count
    await prisma.campaignVariant.update({
      where: { id: assignment.variantId },
      data: {
        conversions: {
          increment: 1
        }
      }
    });

    // Update campaign total conversions
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalConversions: {
          increment: 1
        }
      }
    });

    // Calculate and update conversion rates
    const updatedVariant = await prisma.campaignVariant.findUnique({
      where: { id: assignment.variantId }
    });

    if (updatedVariant && updatedVariant.visitors > 0) {
      const newConversionRate = (updatedVariant.conversions / updatedVariant.visitors) * 100;
      await prisma.campaignVariant.update({
        where: { id: assignment.variantId },
        data: {
          conversionRate: newConversionRate
        }
      });
    }

    // Update campaign conversion rate
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (updatedCampaign && updatedCampaign.totalVisitors > 0) {
      const newCampaignConversionRate = (updatedCampaign.totalConversions / updatedCampaign.totalVisitors) * 100;
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          conversionRate: newCampaignConversionRate
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Conversion tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    );
  }
}