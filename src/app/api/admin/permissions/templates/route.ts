import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize default permission templates
export async function POST(request: Request) {
  try {
    // Clear existing templates
    await prisma.permissionTemplate.deleteMany({});

    // Define all available tabs from AdminDashboard
    const allTabs = [
      // Analytics Dashboard
      { categoryId: 'analytics', tabId: 'overview', name: 'Analytics Overview' },
      { categoryId: 'analytics', tabId: 'steps', name: 'Step Analytics' },
      { categoryId: 'analytics', tabId: 'forms', name: 'Form Analysis' },
      { categoryId: 'analytics', tabId: 'leads', name: 'Lead Analysis' },
      { categoryId: 'analytics', tabId: 'marketing', name: 'Marketing Analysis' },
      { categoryId: 'analytics', tabId: 'realtime', name: 'Real-time Tracking' },
      { categoryId: 'analytics', tabId: 'visitors', name: 'Visitor Tracking' },
      
      // CRM
      { categoryId: 'lead-management', tabId: 'all-leads', name: 'All Leads' },
      { categoryId: 'lead-management', tabId: 'lead-analysis', name: 'Lead Analysis' },
      { categoryId: 'lead-management', tabId: 'visitor-analysis', name: 'Visitor Analysis' },
      { categoryId: 'lead-management', tabId: 'duplicates', name: 'Duplicate Analysis' },
      { categoryId: 'lead-management', tabId: 'reports', name: 'Export/Reports' },
      
      // Page Builder
      { categoryId: 'page-builder', tabId: 'landing-pages', name: 'Landing Pages' },
      { categoryId: 'page-builder', tabId: 'forms', name: 'Forms' },
      { categoryId: 'page-builder', tabId: 'templates', name: 'Templates' },
      { categoryId: 'page-builder', tabId: 'ab-testing', name: 'A/B Testing' },
      
      // Tracking Setup
      { categoryId: 'tracking', tabId: 'datalayer', name: 'DataLayer Events' },
      { categoryId: 'tracking', tabId: 'gtm-config', name: 'GTM Config' },
      { categoryId: 'tracking', tabId: 'integrations', name: 'Platform Integrations' },
      { categoryId: 'tracking', tabId: 'conversion-api', name: 'Conversion API' },
      
      // AI Insights
      { categoryId: 'ai-insights', tabId: 'chatbot', name: 'Chatbot Query' },
      { categoryId: 'ai-insights', tabId: 'auto-reports', name: 'Auto Reports' },
      { categoryId: 'ai-insights', tabId: 'recommendations', name: 'Recommendations' },
      { categoryId: 'ai-insights', tabId: 'alerts', name: 'Performance Alerts' },
      
      // Integrations
      { categoryId: 'integrations', tabId: 'google-ads', name: 'Google Ads' },
      { categoryId: 'integrations', tabId: 'facebook-ads', name: 'Facebook Ads' },
      { categoryId: 'integrations', tabId: 'ga4', name: 'GA4' },
      { categoryId: 'integrations', tabId: 'webhooks', name: 'Webhooks/APIs' },
      
      // User Management
      { categoryId: 'user-management', tabId: 'profile', name: 'My Profile' },
      { categoryId: 'user-management', tabId: 'admin-users', name: 'Manage Users' },
      { categoryId: 'user-management', tabId: 'permissions', name: 'Permissions' },
      { categoryId: 'user-management', tabId: 'activity-logs', name: 'Activity Logs' },
      
      // System Settings
      { categoryId: 'system', tabId: 'general', name: 'General Settings' },
      { categoryId: 'system', tabId: 'api-config', name: 'API Configuration' },
      { categoryId: 'system', tabId: 'solar-pricing', name: 'Solar Pricing' },
      { categoryId: 'system', tabId: 'database', name: 'Database Settings' },
      { categoryId: 'system', tabId: 'backup', name: 'Backup Settings' }
    ];

    // Define permission templates for each role
    const templates = [];

    // SUPER_ADMIN - Full access to everything
    for (const tab of allTabs) {
      templates.push({
        name: `Super Admin - ${tab.name}`,
        description: `Full access to ${tab.name}`,
        role: 'SUPER_ADMIN',
        categoryId: tab.categoryId,
        tabId: tab.tabId,
        canView: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        isDefault: true
      });
    }

    // ADMIN - Most access, limited system settings
    for (const tab of allTabs) {
      const isSystemTab = tab.categoryId === 'system';
      const isUserManagement = tab.categoryId === 'user-management' && ['admin-users', 'permissions'].includes(tab.tabId);
      
      templates.push({
        name: `Admin - ${tab.name}`,
        description: `Admin access to ${tab.name}`,
        role: 'ADMIN',
        categoryId: tab.categoryId,
        tabId: tab.tabId,
        canView: true,
        canEdit: !isSystemTab && !isUserManagement,
        canDelete: !isSystemTab && !isUserManagement && tab.categoryId !== 'lead-management',
        canExport: true,
        isDefault: true
      });
    }

    // EDITOR - Can edit content but limited admin access
    const editorTabs = [
      'analytics', 'lead-management', 'page-builder', 'ai-insights'
    ];
    
    for (const tab of allTabs) {
      if (editorTabs.includes(tab.categoryId) || (tab.categoryId === 'user-management' && tab.tabId === 'profile')) {
        templates.push({
          name: `Editor - ${tab.name}`,
          description: `Edit access to ${tab.name}`,
          role: 'EDITOR',
          categoryId: tab.categoryId,
          tabId: tab.tabId,
          canView: true,
          canEdit: tab.categoryId !== 'user-management',
          canDelete: tab.categoryId === 'page-builder',
          canExport: tab.categoryId === 'analytics' || tab.categoryId === 'lead-management',
          isDefault: true
        });
      }
    }

    // MEMBER - Limited access to specific areas
    const memberTabs = [
      'analytics', 'lead-management'
    ];
    
    for (const tab of allTabs) {
      if (memberTabs.includes(tab.categoryId) || (tab.categoryId === 'user-management' && tab.tabId === 'profile')) {
        templates.push({
          name: `Member - ${tab.name}`,
          description: `Member access to ${tab.name}`,
          role: 'MEMBER',
          categoryId: tab.categoryId,
          tabId: tab.tabId,
          canView: true,
          canEdit: false,
          canDelete: false,
          canExport: false,
          isDefault: true
        });
      }
    }

    // VIEWER - Read-only access to most areas
    const viewerTabs = [
      'analytics', 'lead-management', 'ai-insights'
    ];
    
    for (const tab of allTabs) {
      if (viewerTabs.includes(tab.categoryId) || (tab.categoryId === 'user-management' && tab.tabId === 'profile')) {
        templates.push({
          name: `Viewer - ${tab.name}`,
          description: `View-only access to ${tab.name}`,
          role: 'VIEWER',
          categoryId: tab.categoryId,
          tabId: tab.tabId,
          canView: true,
          canEdit: false,
          canDelete: false,
          canExport: tab.categoryId === 'analytics' || tab.categoryId === 'lead-management',
          isDefault: true
        });
      }
    }

    // Create all templates
    await prisma.permissionTemplate.createMany({
      data: templates
    });

    return NextResponse.json({
      success: true,
      message: `Created ${templates.length} permission templates`,
      data: {
        templatesCreated: templates.length,
        roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MEMBER', 'VIEWER'],
        categories: [...new Set(allTabs.map(t => t.categoryId))],
        tabs: allTabs.length
      }
    });
  } catch (error) {
    console.error('Initialize templates error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize permission templates'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Get all permission templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const where = role ? { role } : {};
    
    const templates = await prisma.permissionTemplate.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { categoryId: 'asc' },
        { tabId: 'asc' }
      ]
    });

    // Group by role and category for easier display
    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.role]) {
        acc[template.role] = {};
      }
      if (!acc[template.role][template.categoryId]) {
        acc[template.role][template.categoryId] = [];
      }
      acc[template.role][template.categoryId].push(template);
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: {
        templates,
        grouped: groupedTemplates,
        roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MEMBER', 'VIEWER']
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch permission templates'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}