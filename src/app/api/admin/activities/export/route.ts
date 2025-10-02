import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const search = searchParams.get('search') || '';
    const format = searchParams.get('format') || 'csv';

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

    // Build where clause
    const where: any = {
      timestamp: {
        gte: timeRangeStart,
        lte: now
      }
    };
    
    if (userId && userId !== 'all') {
      where.userId = parseInt(userId);
    }
    
    if (action && action !== 'all') {
      where.action = action;
    }
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Get activities
    const activities = await prisma.userActivity.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      take: 10000 // Limit to prevent memory issues
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Timestamp',
        'User ID',
        'User Name', 
        'User Email',
        'User Role',
        'Action',
        'Description',
        'Success',
        'Duration (ms)',
        'IP Address',
        'User Agent'
      ];

      const csvRows = [
        headers.join(','),
        ...activities.map(activity => [
          new Date(activity.timestamp).toISOString(),
          activity.userId,
          `"${activity.user.firstName} ${activity.user.lastName}"`,
          activity.user.email,
          activity.user.role,
          activity.action,
          `"${activity.description}"`,
          activity.success,
          activity.duration || '',
          activity.ipAddress || '',
          `"${activity.userAgent || ''}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="activity-report-${timeRange}-${Date.now()}.csv"`
        }
      });

    } else if (format === 'json') {
      // Generate JSON
      const jsonData = {
        exportInfo: {
          generatedAt: new Date().toISOString(),
          timeRange,
          totalRecords: activities.length,
          filters: {
            userId: userId || 'all',
            action: action || 'all',
            search: search || 'none'
          }
        },
        activities: activities.map(activity => ({
          timestamp: activity.timestamp,
          user: {
            id: activity.userId,
            name: `${activity.user.firstName} ${activity.user.lastName}`,
            email: activity.user.email,
            role: activity.user.role
          },
          action: activity.action,
          description: activity.description,
          success: activity.success,
          duration: activity.duration,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          metadata: activity.metadata
        }))
      };

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="activity-report-${timeRange}-${Date.now()}.json"`
        }
      });

    } else {
      return NextResponse.json(
        { message: 'Unsupported format. Use csv or json.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Activity export error:', error);
    return NextResponse.json(
      { message: 'Failed to export activity data' },
      { status: 500 }
    );
  }
}