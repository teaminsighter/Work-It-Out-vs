import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Fire a DataLayer event (for testing and actual tracking)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventName,
      userId,
      sessionId,
      parameters = {},
      testMode = false
    } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Find the event configuration
    const eventConfig = await prisma.dataLayerEvent.findFirst({
      where: { eventName }
    });

    if (!eventConfig) {
      return NextResponse.json(
        { error: 'Event configuration not found' },
        { status: 404 }
      );
    }

    // Only fire if event is active (unless in test mode)
    if (eventConfig.status !== 'active' && !testMode) {
      return NextResponse.json(
        { error: 'Event is not active' },
        { status: 400 }
      );
    }

    // Record the event fire
    const eventFire = await prisma.eventFire.create({
      data: {
        eventId: eventConfig.id,
        userId: userId || `anonymous_${Date.now()}`,
        sessionId: sessionId || `session_${Date.now()}`,
        parameters: typeof parameters === 'string' ? parameters : JSON.stringify(parameters),
        testMode,
        timestamp: new Date()
      }
    });

    // Get IP and user agent for tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Track this as a user interaction
    await prisma.userInteraction.create({
      data: {
        userId: userId || `anonymous_${Date.now()}`,
        sessionId: sessionId || `session_${Date.now()}`,
        eventType: 'datalayer_event',
        eventData: JSON.stringify({
          eventName,
          parameters,
          testMode,
          ipAddress,
          userAgent
        }),
        page: (typeof parameters === 'object' && parameters.page_url) ? parameters.page_url : 'unknown',
        elementId: eventName,
        timestamp: new Date()
      }
    });

    // Format response for frontend
    const response = {
      success: true,
      message: `Event '${eventName}' fired successfully`,
      data: {
        eventId: eventFire.id,
        eventName,
        userId: eventFire.userId,
        sessionId: eventFire.sessionId,
        parameters: eventFire.parameters,
        timestamp: eventFire.timestamp,
        testMode: eventFire.testMode
      }
    };

    // If this is a test fire, add debugging info
    if (testMode) {
      response.data = {
        ...response.data,
        debugInfo: {
          eventConfig: {
            id: eventConfig.id,
            description: eventConfig.description,
            triggerCondition: eventConfig.triggerCondition
          },
          expectedParameters: eventConfig.parameters,
          actualParameters: parameters
        }
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error firing DataLayer event:', error);
    return NextResponse.json(
      { error: 'Failed to fire event' },
      { status: 500 }
    );
  }
}

// GET - Get recent event fires for monitoring
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const eventName = searchParams.get('eventName');
    const testMode = searchParams.get('testMode');

    const where: any = {};
    if (eventName) {
      const event = await prisma.dataLayerEvent.findFirst({
        where: { eventName }
      });
      if (event) {
        where.eventId = event.id;
      }
    }
    if (testMode !== null) {
      where.testMode = testMode === 'true';
    }

    const eventFires = await prisma.eventFire.findMany({
      where,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        event: {
          select: {
            eventName: true,
            description: true
          }
        }
      }
    });

    const formattedFires = eventFires.map(fire => ({
      id: fire.id,
      eventName: fire.event.eventName,
      description: fire.event.description,
      userId: fire.userId,
      sessionId: fire.sessionId,
      parameters: fire.parameters,
      testMode: fire.testMode,
      timestamp: fire.timestamp.toISOString(),
      timeAgo: getTimeAgo(fire.timestamp)
    }));

    return NextResponse.json(formattedFires);
  } catch (error) {
    console.error('Error fetching event fires:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event fires' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
}