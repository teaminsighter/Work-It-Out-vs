import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check if user has specific permissions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, categoryId, tabId, action = 'view' } = body;

    // For development mode, allow all permissions
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        hasPermission: true,
        permissions: {
          canView: true,
          canEdit: true,
          canDelete: true,
          canExport: true
        },
        userRole: 'SUPER_ADMIN'
      });
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Get user with permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          where: categoryId && tabId ? {
            categoryId,
            tabId
          } : undefined
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Super Admin has access to everything
    if (user.role === 'SUPER_ADMIN') {
      // If checking specific permission, return true immediately
      if (categoryId && tabId) {
        return NextResponse.json({
          success: true,
          data: {
            hasPermission: true,
            reason: 'Super Admin access',
            permission: {
              canView: true,
              canEdit: true,
              canDelete: true,
              canExport: true
            },
            user: {
              id: user.id,
              email: user.email,
              role: user.role
            }
          }
        });
      }
      
      // Generate complete permission map for super admin
      const allTabs = [
        // Analytics Dashboard
        { categoryId: 'analytics', tabId: 'overview' },
        { categoryId: 'analytics', tabId: 'steps' },
        { categoryId: 'analytics', tabId: 'forms' },
        { categoryId: 'analytics', tabId: 'leads' },
        { categoryId: 'analytics', tabId: 'marketing' },
        { categoryId: 'analytics', tabId: 'realtime' },
        { categoryId: 'analytics', tabId: 'visitors' },
        
        // CRM
        { categoryId: 'lead-management', tabId: 'all-leads' },
        { categoryId: 'lead-management', tabId: 'lead-analysis' },
        { categoryId: 'lead-management', tabId: 'visitor-analysis' },
        { categoryId: 'lead-management', tabId: 'duplicates' },
        { categoryId: 'lead-management', tabId: 'reports' },
        
        // Page Builder
        { categoryId: 'page-builder', tabId: 'landing-pages' },
        { categoryId: 'page-builder', tabId: 'forms' },
        { categoryId: 'page-builder', tabId: 'templates' },
        { categoryId: 'page-builder', tabId: 'ab-testing' },
        
        // Tracking Setup
        { categoryId: 'tracking', tabId: 'datalayer' },
        { categoryId: 'tracking', tabId: 'gtm-config' },
        { categoryId: 'tracking', tabId: 'integrations' },
        { categoryId: 'tracking', tabId: 'conversion-api' },
        
        // AI Insights
        { categoryId: 'ai-insights', tabId: 'chatbot' },
        { categoryId: 'ai-insights', tabId: 'auto-reports' },
        { categoryId: 'ai-insights', tabId: 'recommendations' },
        { categoryId: 'ai-insights', tabId: 'alerts' },
        
        // Integrations
        { categoryId: 'integrations', tabId: 'google-ads' },
        { categoryId: 'integrations', tabId: 'facebook-ads' },
        { categoryId: 'integrations', tabId: 'ga4' },
        { categoryId: 'integrations', tabId: 'webhooks' },
        
        // User Management
        { categoryId: 'user-management', tabId: 'profile' },
        { categoryId: 'user-management', tabId: 'admin-users' },
        { categoryId: 'user-management', tabId: 'permissions' },
        { categoryId: 'user-management', tabId: 'activity-logs' },
        
        // System Settings
        { categoryId: 'system', tabId: 'general' },
        { categoryId: 'system', tabId: 'api-config' },
        { categoryId: 'system', tabId: 'solar-pricing' },
        { categoryId: 'system', tabId: 'database' },
        { categoryId: 'system', tabId: 'backup' }
      ];

      const permissionMap = allTabs.reduce((acc, tab) => {
        const key = `${tab.categoryId}.${tab.tabId}`;
        acc[key] = {
          canView: true,
          canEdit: true,
          canDelete: true,
          canExport: true
        };
        return acc;
      }, {} as any);

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive
          },
          permissions: [],
          permissionMap
        }
      });
    }

    // If checking specific permission
    if (categoryId && tabId) {
      const permission = user.permissions.find(
        p => p.categoryId === categoryId && p.tabId === tabId
      );

      if (!permission) {
        return NextResponse.json({
          success: true,
          data: {
            hasPermission: false,
            reason: 'No permission record found',
            user: {
              id: user.id,
              email: user.email,
              role: user.role
            }
          }
        });
      }

      let hasPermission = false;
      switch (action) {
        case 'view':
          hasPermission = permission.canView;
          break;
        case 'edit':
          hasPermission = permission.canEdit;
          break;
        case 'delete':
          hasPermission = permission.canDelete;
          break;
        case 'export':
          hasPermission = permission.canExport;
          break;
        default:
          hasPermission = permission.canView;
      }

      return NextResponse.json({
        success: true,
        data: {
          hasPermission,
          reason: hasPermission ? `Has ${action} permission` : `No ${action} permission`,
          permission,
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      });
    }

    // Return all user permissions
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        permissions: user.permissions,
        permissionMap: user.permissions.reduce((acc, perm) => {
          const key = `${perm.categoryId}.${perm.tabId}`;
          acc[key] = {
            canView: perm.canView,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            canExport: perm.canExport
          };
          return acc;
        }, {} as any)
      }
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check permissions'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}