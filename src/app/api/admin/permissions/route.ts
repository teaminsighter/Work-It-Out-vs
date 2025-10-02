import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user permissions or all users with their permissions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeTemplates = searchParams.get('includeTemplates') === 'true';

    if (userId) {
      // Get specific user's permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: true
        }
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          user,
          permissions: user.permissions
        }
      });
    } else {
      // Get all users with their permissions
      const users = await prisma.user.findMany({
        include: {
          permissions: true
        },
        orderBy: { createdAt: 'desc' }
      });

      let templates = [];
      if (includeTemplates) {
        templates = await prisma.permissionTemplate.findMany({
          orderBy: [{ role: 'asc' }, { categoryId: 'asc' }, { tabId: 'asc' }]
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          users,
          templates
        }
      });
    }
  } catch (error) {
    console.error('Permissions API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch permissions'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Update user permissions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, permissions, grantedBy } = body;

    if (!userId || !permissions || !grantedBy) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, permissions, grantedBy'
      }, { status: 400 });
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Delete existing permissions for this user
    await prisma.userPermission.deleteMany({
      where: { userId }
    });

    // Create new permissions
    const permissionData = permissions.map((perm: any) => ({
      userId,
      categoryId: perm.categoryId,
      tabId: perm.tabId,
      canView: perm.canView || false,
      canEdit: perm.canEdit || false,
      canDelete: perm.canDelete || false,
      canExport: perm.canExport || false,
      grantedBy
    }));

    await prisma.userPermission.createMany({
      data: permissionData
    });

    // Get updated user with permissions
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update permissions'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Apply permission template to user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, role, grantedBy } = body;

    if (!userId || !role || !grantedBy) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, role, grantedBy'
      }, { status: 400 });
    }

    // Get permission templates for the role
    const templates = await prisma.permissionTemplate.findMany({
      where: { role }
    });

    if (templates.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No permission templates found for role: ${role}`
      }, { status: 404 });
    }

    // Delete existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId }
    });

    // Apply template permissions
    const permissionData = templates.map(template => ({
      userId,
      categoryId: template.categoryId,
      tabId: template.tabId,
      canView: template.canView,
      canEdit: template.canEdit,
      canDelete: template.canDelete,
      canExport: template.canExport,
      grantedBy
    }));

    await prisma.userPermission.createMany({
      data: permissionData
    });

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    // Get updated user with permissions
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Applied ${role} permissions to user`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Apply template error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to apply permission template'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}