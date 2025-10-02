import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const clearLeads = body.clearLeads || false;
    
    // Clear all visitor tracking data (seeded data)
    const deletedVisitors = await prisma.visitorTracking.deleteMany({});
    
    let deletedLeads = { count: 0 };
    let deletedSystemDetails = { count: 0 };
    
    if (clearLeads) {
      // Also clear test leads if requested
      deletedSystemDetails = await prisma.systemDetails.deleteMany({});
      deletedLeads = await prisma.lead.deleteMany({});
    }
    
    return NextResponse.json({
      success: true,
      message: `Analytics data cleared successfully`,
      data: {
        deletedVisitors: deletedVisitors.count,
        deletedLeads: deletedLeads.count,
        deletedSystemDetails: deletedSystemDetails.count
      }
    });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear visitor data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}