import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get real-time data for the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    // Active users (based on recent visitor tracking - no fake random numbers)
    const recentVisitors = await prisma.visitorTracking.count({
      where: {
        timestamp: {
          gte: oneHourAgo
        }
      }
    });

    // Active sessions (based on unique session IDs in last hour)
    const activeSessions = await prisma.visitorTracking.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: {
          gte: oneHourAgo
        }
      }
    });

    const activeUsers = activeSessions.length;

    // Today's leads
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const leadsToday = await prisma.lead.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });

    // Today's total page views
    const pageViewsToday = await prisma.visitorTracking.count({
      where: {
        timestamp: {
          gte: todayStart
        }
      }
    });

    // Real-time page views (last 5 minutes)
    const recentPageViews = await prisma.visitorTracking.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      select: {
        page: true,
        timestamp: true,
        city: true,
        country: true,
        deviceType: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });

    // Current conversion rate (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const last24HourLeads = await prisma.lead.count({
      where: {
        createdAt: {
          gte: last24Hours
        }
      }
    });

    const last24HourViews = await prisma.visitorTracking.count({
      where: {
        timestamp: {
          gte: last24Hours
        }
      }
    });

    const conversionRate = last24HourViews > 0 ? (last24HourLeads / last24HourViews) * 100 : 0;

    // Calculate average session duration from real data
    const avgSessionDuration = await calculateAverageSessionDuration();

    // Geographic distribution - only real data
    const geoData = await prisma.visitorTracking.groupBy({
      by: ['country', 'city'],
      where: {
        timestamp: {
          gte: oneHourAgo
        }
      },
      _count: true,
      orderBy: {
        _count: {
          country: 'desc'
        }
      },
      take: 5
    });

    // Device breakdown - only real data
    const deviceData = await prisma.visitorTracking.groupBy({
      by: ['deviceType'],
      where: {
        timestamp: {
          gte: oneHourAgo
        }
      },
      _count: true
    });

    // Traffic sources for recent leads
    const recentLeadSources = await prisma.lead.groupBy({
      by: ['source'],
      where: {
        createdAt: {
          gte: oneHourAgo
        }
      },
      _count: true,
      orderBy: {
        _count: {
          source: 'desc'
        }
      }
    });

    const response = {
      success: true,
      data: {
        realtime: {
          activeUsers,
          leadsToday,
          conversionRate: Number(conversionRate.toFixed(2)),
          avgSessionDuration,
          pageViewsToday,
          pageViewsLast5Min: recentPageViews.length,
          bounceRate: 0, // Would need detailed analytics to calculate properly
        },
        liveActivity: recentPageViews.map(view => ({
          type: 'page_view',
          page: view.page,
          location: view.city && view.country ? `${view.city}, ${view.country}` : 'Unknown Location',
          device: view.deviceType || 'unknown',
          timestamp: view.timestamp,
          timeAgo: getTimeAgo(view.timestamp)
        })),
        geoDistribution: geoData.length > 0 ? geoData.map(geo => ({
          location: `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}`,
          visitors: geo._count,
          percentage: activeUsers > 0 ? Number(((geo._count / activeUsers) * 100).toFixed(1)) : 0
        })) : [],
        deviceBreakdown: deviceData.length > 0 ? deviceData.map(device => ({
          type: device.deviceType || 'unknown',
          count: device._count,
          percentage: recentVisitors > 0 ? Number(((device._count / recentVisitors) * 100).toFixed(1)) : 0
        })) : [],
        trafficSources: recentLeadSources.length > 0 ? recentLeadSources.map(source => ({
          source: source.source,
          leads: source._count,
          percentage: leadsToday > 0 ? Number(((source._count / leadsToday) * 100).toFixed(1)) : 0
        })) : [],
        timestamp: now.toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Real-time analytics API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch real-time analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function calculateAverageSessionDuration(): Promise<number> {
  try {
    // Get sessions from the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const sessions = await prisma.visitorTracking.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: {
          gte: last24Hours
        }
      },
      _min: {
        timestamp: true
      },
      _max: {
        timestamp: true
      }
    });

    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      if (session._min.timestamp && session._max.timestamp) {
        const duration = session._max.timestamp.getTime() - session._min.timestamp.getTime();
        return sum + duration;
      }
      return sum;
    }, 0);

    return Math.floor(totalDuration / sessions.length / 1000); // Convert to seconds
  } catch (error) {
    console.error('Error calculating session duration:', error);
    return 0;
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  
  if (diffSecs < 60) return `${diffSecs}s ago`;
  
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h ago`;
}