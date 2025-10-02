import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('range') || '7d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    // Get visitor tracking data
    const visitors = await prisma.visitorTracking.findMany({
      where: {
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Calculate metrics
    const totalVisitors = visitors.length;
    const uniqueVisitors = new Set(visitors.map(v => `${v.ipAddress}-${v.userAgent}`)).size;
    const bounceRate = Math.random() * 30 + 40; // Mock bounce rate

    // Page views breakdown
    const pageViews = visitors.reduce((acc, visit) => {
      acc[visit.page] = (acc[visit.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPages = Object.entries(pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({
        page,
        views,
        percentage: Number(((views / totalVisitors) * 100).toFixed(1))
      }));

    // Geographic distribution
    const geoData = visitors.reduce((acc, visit) => {
      if (visit.country && visit.city) {
        const location = `${visit.city}, ${visit.country}`;
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topLocations = Object.entries(geoData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location, visits]) => ({
        location,
        visits,
        percentage: Number(((visits / totalVisitors) * 100).toFixed(1))
      }));

    // Device breakdown
    const deviceData = visitors.reduce((acc, visit) => {
      const device = visit.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceBreakdown = Object.entries(deviceData).map(([device, count]) => ({
      device,
      count,
      percentage: Number(((count / totalVisitors) * 100).toFixed(1))
    }));

    // Browser breakdown
    const browserData = visitors.reduce((acc, visit) => {
      const browser = visit.browser || 'unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const browserBreakdown = Object.entries(browserData).map(([browser, count]) => ({
      browser,
      count,
      percentage: Number(((count / totalVisitors) * 100).toFixed(1))
    }));

    // Referrer data
    const referrerData = visitors.reduce((acc, visit) => {
      const referrer = visit.referrer || 'Direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topReferrers = Object.entries(referrerData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([referrer, visits]) => ({
        referrer,
        visits,
        percentage: Number(((visits / totalVisitors) * 100).toFixed(1))
      }));

    // Hourly distribution
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourVisits = visitors.filter(v => new Date(v.timestamp).getHours() === hour).length;
      return {
        hour,
        visits: hourVisits,
        percentage: Number(((hourVisits / totalVisitors) * 100).toFixed(1))
      };
    });

    // Daily trends (last 7 days)
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayVisits = visitors.filter(v => {
        const visitDate = new Date(v.timestamp);
        return visitDate >= date && visitDate < nextDay;
      }).length;
      
      const dayUniqueVisitors = new Set(
        visitors.filter(v => {
          const visitDate = new Date(v.timestamp);
          return visitDate >= date && visitDate < nextDay;
        }).map(v => `${v.ipAddress}-${v.userAgent}`)
      ).size;
      
      dailyTrends.push({
        date: date.toISOString().split('T')[0],
        visits: dayVisits,
        uniqueVisitors: dayUniqueVisitors
      });
    }

    // Recent visitors (last 50)
    const recentVisitors = visitors.slice(0, 50).map(visitor => ({
      id: visitor.id,
      page: visitor.page,
      location: `${visitor.city || 'Unknown'}, ${visitor.country || 'Unknown'}`,
      device: visitor.deviceType || 'unknown',
      browser: visitor.browser || 'unknown',
      referrer: visitor.referrer || 'Direct',
      timestamp: visitor.timestamp,
      timeAgo: getTimeAgo(visitor.timestamp)
    }));

    const response = {
      success: true,
      data: {
        overview: {
          totalVisitors,
          uniqueVisitors,
          bounceRate: Number(bounceRate.toFixed(1)),
          avgSessionDuration: Math.floor(Math.random() * 300 + 120), // Mock average session duration
          pageViews: totalVisitors,
          returningVisitors: Math.floor(uniqueVisitors * 0.3) // Mock returning visitors
        },
        topPages,
        topLocations,
        deviceBreakdown,
        browserBreakdown,
        topReferrers,
        hourlyDistribution: hourlyData,
        dailyTrends,
        recentVisitors,
        dateRange,
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Visitor analytics API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch visitor analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}