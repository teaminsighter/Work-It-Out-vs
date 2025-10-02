import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId,
      sessionId,
      page, 
      referrer = null, 
      userAgent = 'Unknown', 
      utmSource = null,
      utmMedium = null,
      utmCampaign = null,
      timestamp
    } = body;

    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';

    // Extract basic info from user agent
    const deviceType = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                      userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop';
    
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown';

    // Check if this is a new session
    const existingSession = await prisma.userSession.findUnique({
      where: { sessionId }
    });

    // Create or update session
    if (!existingSession) {
      await prisma.userSession.create({
        data: {
          userId: userId || `visitor_${Date.now()}`,
          sessionId,
          startTime: new Date(timestamp || Date.now()),
          pageViews: 1,
          deviceType,
          browser,
          os: deviceType === 'mobile' ? 'iOS/Android' : 'Desktop',
          country: 'Unknown', // Would need geo-IP service
          city: 'Unknown',
          referrer,
          utmSource,
          utmMedium,
          utmCampaign
        }
      });
    } else {
      // Update existing session
      await prisma.userSession.update({
        where: { sessionId },
        data: {
          pageViews: { increment: 1 },
          endTime: new Date(timestamp || Date.now())
        }
      });
    }

    // Create visitor tracking record
    const visitor = await prisma.visitorTracking.create({
      data: {
        userId: userId || `visitor_${Date.now()}`,
        ipAddress,
        country: 'Unknown', // Would need geo-IP service for real location
        city: 'Unknown',
        region: 'Unknown',
        userAgent,
        page,
        referrer,
        sessionId,
        deviceType,
        browser,
        os: deviceType === 'mobile' ? 'iOS/Android' : 'Desktop',
        isBot: false,
        timestamp: new Date(timestamp || Date.now())
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Visit tracked successfully',
      data: {
        id: visitor.id,
        userId: visitor.userId,
        sessionId: visitor.sessionId,
        page: visitor.page,
        timestamp: visitor.timestamp
      }
    });
  } catch (error) {
    console.error('Visit tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track visit'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}