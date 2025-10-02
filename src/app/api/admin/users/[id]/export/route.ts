import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get user activities
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Get user permissions
    const permissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true
      }
    });

    // Compile user data export
    const exportData = {
      user: {
        ...user,
        exportedAt: new Date().toISOString(),
        exportedBy: 'Self'
      },
      activities: activities.map(activity => ({
        action: activity.action,
        description: activity.description,
        timestamp: activity.timestamp,
        metadata: activity.metadata
      })),
      permissions: permissions.map(p => ({
        permission: p.permission.name,
        resource: p.permission.resource,
        grantedAt: p.createdAt
      })),
      summary: {
        totalActivities: activities.length,
        totalPermissions: permissions.length,
        accountAge: Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        lastActivity: activities[0]?.timestamp || null
      }
    };

    // Log the export activity
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'DATA_EXPORTED',
        description: 'User exported their personal data',
        metadata: {
          timestamp: new Date().toISOString(),
          exportSize: JSON.stringify(exportData).length,
          userAgent: request.headers.get('user-agent') || 'Unknown'
        }
      }
    });

    // Return as downloadable JSON
    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-${user.email}-data.json"`
      }
    });

    return response;

  } catch (error) {
    console.error('User data export error:', error);
    return NextResponse.json(
      { message: 'Failed to export user data' },
      { status: 500 }
    );
  }
}