import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dateRange = searchParams.get('range') || '30d';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    if (userId) {
      // Get specific user analytics - return empty for now since userId tracking is new
      // In the future, this will use the enhanced visitor tracking with actual userIds
      const userVisits: any[] = []; // Empty until new tracking data comes in

      // Calculate user metrics from visits
      const totalPageViews = userVisits.length;
      const uniqueSessions = [...new Set(userVisits.map(v => v.sessionId).filter(Boolean))].length;
      const totalDuration = userVisits.reduce((sum, visit) => sum + (visit.timeOnPage || 0), 0);
      const avgSessionDuration = uniqueSessions > 0 ? Math.floor(totalDuration / uniqueSessions) : 0;

      // Get user journey from visits
      const journey = userVisits.map(visit => ({
        page: visit.page,
        timestamp: visit.timestamp.toISOString(),
        timeOnPage: visit.timeOnPage,
        scrollDepth: visit.scrollDepth,
        deviceType: visit.deviceType,
        referrer: visit.referrer
      }));

      // Mock interactions and form progress for now (until real data exists)
      const interactions: any[] = [];
      const formProgress: any[] = [];

      return NextResponse.json({
        success: true,
        data: {
          userId,
          summary: {
            totalSessions: uniqueSessions,
            totalPageViews,
            totalDuration,
            avgSessionDuration,
            totalInteractions: interactions.length,
            formStarted: formProgress.length > 0,
            formCompleted: formProgress.some((fp: any) => fp.isCompleted),
            leadGenerated: false, // Will be true once lead tracking is connected
            firstVisit: userVisits[userVisits.length - 1]?.timestamp.toISOString(),
            lastVisit: userVisits[0]?.timestamp.toISOString()
          },
          sessions: [], // Will populate once UserSession table has data
          journey,
          interactions,
          formProgress
        }
      });
    } else {
      // Get all visitors analytics using existing VisitorTracking table
      const totalVisitsCount = await prisma.visitorTracking.count({
        where: { timestamp: { gte: startDate } }
      });

      const visits = await prisma.visitorTracking.findMany({
        where: { timestamp: { gte: startDate } },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      // Calculate unique visitors from existing data
      const uniqueUserIds = [...new Set(visits.map(v => v.userId).filter(Boolean))];
      const uniqueVisitors = uniqueUserIds.length;
      
      // Calculate summary stats
      const totalPageViews = visits.length;
      const totalDuration = visits.reduce((sum, visit) => sum + (visit.timeOnPage || 0), 0);
      const avgSessionDuration = uniqueVisitors > 0 ? Math.floor(totalDuration / uniqueVisitors) : 0;

      // Get top pages
      const pageCountMap: Record<string, number> = {};
      visits.forEach(visit => {
        pageCountMap[visit.page] = (pageCountMap[visit.page] || 0) + 1;
      });
      
      const topPages = Object.entries(pageCountMap)
        .map(([page, count]) => ({ page, views: count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Get traffic sources (from referrer for now)
      const sourceCountMap: Record<string, number> = {};
      visits.forEach(visit => {
        if (visit.referrer) {
          const domain = visit.referrer.includes('://') ? 
            new URL(visit.referrer).hostname : visit.referrer;
          sourceCountMap[domain] = (sourceCountMap[domain] || 0) + 1;
        }
      });
      
      const trafficSources = Object.entries(sourceCountMap)
        .map(([source, count]) => ({ source, visitors: count }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 10);

      // Convert visits to visitor format
      const visitors = visits.map(visit => ({
        userId: visit.userId || 'anonymous',
        sessionId: visit.sessionId || 'unknown',
        startTime: visit.timestamp.toISOString(),
        endTime: null,
        duration: visit.timeOnPage,
        pageViews: 1, // Each record is one page view
        deviceType: visit.deviceType,
        browser: visit.browser,
        country: visit.country,
        city: visit.city,
        referrer: visit.referrer,
        utmSource: null, // Will add UTM tracking later
        utmMedium: null,
        utmCampaign: null,
        leadGenerated: Boolean(visit.leadId)
      }));

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalVisitors: totalVisitsCount,
            uniqueVisitors,
            totalPageViews,
            avgSessionDuration,
            topPages,
            trafficSources
          },
          visitors: visitors.slice(0, limit), // Apply limit
          pagination: {
            page,
            limit,
            total: totalVisitsCount,
            totalPages: Math.ceil(totalVisitsCount / limit)
          }
        }
      });
    }
  } catch (error) {
    console.error('Visitor analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch visitor analytics'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}