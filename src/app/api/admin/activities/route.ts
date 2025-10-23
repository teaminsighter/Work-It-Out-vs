import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user activities with filtering and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const timeRange = searchParams.get('timeRange') || '24h';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const success = searchParams.get('success');

    const skip = (page - 1) * limit;

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
    
    if (category) {
      where.category = category;
    }
    
    if (success !== null && success !== undefined) {
      where.success = success === 'true';
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Get activities with user info
    const [activities, totalCount] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              avatar: true
            }
          }
        }
      }),
      prisma.userActivity.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Get comprehensive activity statistics
    const [topActions, roleActivity, uniqueUsers, criticalCount, recentLogins] = await Promise.all([
      // Top actions
      prisma.userActivity.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 5
      }),
      
      // Activity by role - simplified groupBy
      prisma.userActivity.groupBy({
        by: ['userId', 'action'],
        where,
        _count: { action: true }
      }),
      
      // Unique active users
      prisma.userActivity.findMany({
        where,
        distinct: ['userId'],
        select: { userId: true }
      }),
      
      // Critical actions count
      prisma.userActivity.count({
        where: {
          ...where,
          action: {
            in: ['USER_DEACTIVATED', 'PERMISSION_REVOKED', 'PASSWORD_CHANGED', 'USER_DELETED']
          }
        }
      }),
      
      // Recent logins (last 24h)
      prisma.userActivity.count({
        where: {
          action: 'USER_LOGIN',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get role activity summary
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: {
        id: {
          in: activities.map(a => a.userId)
        }
      },
      _count: { role: true }
    });

    // Format summary data
    const summary = {
      totalActivities: totalCount,
      activeUsers: uniqueUsers.length,
      recentLogins,
      criticalActions: criticalCount,
      topActions: topActions.map(action => ({
        action: action.action,
        count: action._count.action
      })),
      hourlyActivity: [], // Could implement hourly breakdown if needed
      roleActivity: roleStats.map(role => ({
        role: role.role,
        count: role._count.role
      }))
    };

    return NextResponse.json({
      activities,
      summary,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activities'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Log new activity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      action,
      category,
      target,
      targetType,
      description,
      metadata,
      ipAddress,
      userAgent,
      success = true,
      errorMessage,
      duration
    } = body;

    // Validate required fields
    if (!userId || !action || !category || !description) {
      return NextResponse.json({
        success: false,
        error: 'userId, action, category, and description are required'
      }, { status: 400 });
    }

    // Create activity log
    const activity = await prisma.userActivity.create({
      data: {
        userId,
        action,
        category,
        target,
        targetType,
        description,
        metadata,
        ipAddress,
        userAgent,
        success,
        errorMessage,
        duration
      },
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
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
      data: activity
    });
  } catch (error) {
    console.error('Log activity error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to log activity'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Get activity analytics
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { timeRange = '7d', userId } = body;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const where: any = {
      timestamp: {
        gte: startDate,
        lte: now
      }
    };

    if (userId) {
      where.userId = userId;
    }

    // Get various analytics
    const [
      totalActivities,
      activitiesByAction,
      activitiesByCategory,
      activitiesByDay,
      topUsers,
      errorActivities
    ] = await Promise.all([
      // Total activities count
      prisma.userActivity.count({ where }),
      
      // Activities grouped by action
      prisma.userActivity.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } }
      }),
      
      // Activities grouped by category
      prisma.userActivity.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      }),
      
      // Activities by day
      prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as count
        FROM user_activities 
        WHERE timestamp >= ${startDate} AND timestamp <= ${now}
        ${userId ? `AND user_id = '${userId}'` : ''}
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `,
      
      // Top active users
      userId ? null : prisma.userActivity.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      }),
      
      // Error activities
      prisma.userActivity.count({
        where: {
          ...where,
          success: false
        }
      })
    ]);

    // Get user details for top users if not filtering by specific user
    let topUsersWithDetails = null;
    if (topUsers && !userId) {
      const userIds = topUsers.map((u: any) => u.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true
        }
      });

      topUsersWithDetails = topUsers.map((userActivity: any) => {
        const user = users.find(u => u.id === userActivity.userId);
        return {
          user,
          activityCount: userActivity._count.userId
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalActivities,
          errorActivities,
          successRate: totalActivities > 0 ? ((totalActivities - errorActivities) / totalActivities * 100).toFixed(2) : 100,
          timeRange
        },
        charts: {
          activitiesByAction: activitiesByAction.map((item: any) => ({
            action: item.action,
            count: item._count.action
          })),
          activitiesByCategory: activitiesByCategory.map((item: any) => ({
            category: item.category,
            count: item._count.category
          })),
          activitiesByDay: activitiesByDay
        },
        topUsers: topUsersWithDetails
      }
    });
  } catch (error) {
    console.error('Get activity analytics error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activity analytics'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}