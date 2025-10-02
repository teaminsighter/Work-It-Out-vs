import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      usersWithActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      pendingUsers: 0, // Placeholder - would need status field in schema
      suspendedUsers: inactiveUsers,
      newUsersThisMonth,
      activeToday: usersWithActivity
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user statistics'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}