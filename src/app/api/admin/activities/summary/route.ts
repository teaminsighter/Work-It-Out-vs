import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Calculate time range
    const now = new Date();
    let timeRangeStart = new Date();
    
    switch (timeRange) {
      case '1h':
        timeRangeStart.setHours(now.getHours() - 1);
        break;
      case '24h':
        timeRangeStart.setDate(now.getDate() - 1);
        break;
      case '7d':
        timeRangeStart.setDate(now.getDate() - 7);
        break;
      case '30d':
        timeRangeStart.setDate(now.getDate() - 30);
        break;
      default:
        timeRangeStart.setDate(now.getDate() - 1);
    }

    const where = {
      timestamp: {
        gte: timeRangeStart,
        lte: now
      }
    };

    // Get summary statistics
    const [
      totalLogs,
      uniqueUsers,
      successfulActions,
      failedActions,
      securityEvents,
      todayActivity
    ] = await Promise.all([
      prisma.userActivity.count({ where }),
      prisma.userActivity.findMany({
        where,
        select: { userId: true },
        distinct: ['userId']
      }).then(activities => activities.length),
      prisma.userActivity.count({
        where: {
          ...where,
          success: true
        }
      }),
      prisma.userActivity.count({
        where: {
          ...where,
          success: false
        }
      }),
      prisma.userActivity.count({
        where: {
          ...where,
          category: 'security'
        }
      }),
      prisma.userActivity.count({
        where: {
          timestamp: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lte: new Date(now.setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    const summary = {
      totalLogs,
      uniqueUsers,
      successfulActions,
      failedActions,
      securityEvents,
      todayActivity
    };

    return NextResponse.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activity summary'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}