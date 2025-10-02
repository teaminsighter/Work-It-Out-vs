import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all users with their details
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with counts
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: {
              activities: true,
              sessions: true,
              createdUsers: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Create new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      username,
      password,
      role = 'VIEWER',
      department,
      jobTitle,
      phoneNumber,
      bio,
      timezone = 'UTC',
      language = 'en',
      createdBy
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email, first name, last name, and password are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          username ? { username } : {}
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email or username already exists'
      }, { status: 400 });
    }

    // Note: In production, password would be hashed here
    // For development, we'll skip password hashing since this is a demo

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        username,
        role,
        department,
        jobTitle,
        phoneNumber,
        bio,
        timezone,
        language,
        createdBy,
        // Note: password would be stored in a separate table in production
        // For now, we'll use the existing auth system structure
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Log the user creation activity
    if (createdBy) {
      await prisma.userActivity.create({
        data: {
          userId: createdBy,
          action: 'create_user',
          category: 'user_management',
          target: user.id,
          targetType: 'user',
          description: `Created new user: ${user.firstName} ${user.lastName} (${user.email})`,
          metadata: {
            newUserRole: user.role,
            newUserEmail: user.email
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Update user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      email,
      firstName,
      lastName,
      username,
      role,
      department,
      jobTitle,
      phoneNumber,
      bio,
      timezone,
      language,
      isActive,
      updatedBy
    } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check for email/username conflicts
    if (email !== existingUser.email || username !== existingUser.username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { email },
                username ? { username } : {}
              ].filter(Boolean)
            }
          ]
        }
      });

      if (conflictUser) {
        return NextResponse.json({
          success: false,
          error: 'Email or username already exists'
        }, { status: 400 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        username,
        role,
        department,
        jobTitle,
        phoneNumber,
        bio,
        timezone,
        language,
        isActive,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Log the user update activity
    if (updatedBy) {
      const changes = [];
      if (role !== existingUser.role) changes.push(`role: ${existingUser.role} → ${role}`);
      if (isActive !== existingUser.isActive) changes.push(`status: ${existingUser.isActive ? 'active' : 'inactive'} → ${isActive ? 'active' : 'inactive'}`);
      
      await prisma.userActivity.create({
        data: {
          userId: updatedBy,
          action: 'update_user',
          category: 'user_management',
          target: id,
          targetType: 'user',
          description: `Updated user: ${updatedUser.firstName} ${updatedUser.lastName}${changes.length > 0 ? ` (${changes.join(', ')})` : ''}`,
          metadata: {
            changes: {
              old: { role: existingUser.role, isActive: existingUser.isActive },
              new: { role, isActive }
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Delete user (soft delete)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const deletedBy = searchParams.get('deletedBy');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Soft delete by deactivating
    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Log the user deactivation activity
    if (deletedBy) {
      await prisma.userActivity.create({
        data: {
          userId: deletedBy,
          action: 'deactivate_user',
          category: 'user_management',
          target: userId,
          targetType: 'user',
          description: `Deactivated user: ${user.firstName} ${user.lastName} (${user.email})`,
          metadata: {
            deactivatedUserRole: user.role,
            deactivatedUserEmail: user.email
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      data: deactivatedUser
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate user'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}