import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sync permission templates - create missing ones for new roles
export async function POST(request: Request) {
  try {
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

    // Get existing templates
    const existingTemplates = await prisma.permissionTemplate.findMany({
      select: {
        role: true,
        categoryId: true,
        tabId: true
      }
    });

    const existingKeys = new Set(
      existingTemplates.map(t => `${t.role}-${t.categoryId}-${t.tabId}`)
    );

    const newTemplates = [];

    // EDITOR - Can edit content but limited admin access
    const editorTabs = [
      'analytics', 'lead-management', 'page-builder', 'ai-insights'
    ];
    
    for (const tab of allTabs) {
      if (editorTabs.includes(tab.categoryId) || (tab.categoryId === 'user-management' && tab.tabId === 'profile')) {
        const key = `EDITOR-${tab.categoryId}-${tab.tabId}`;
        if (!existingKeys.has(key)) {
          newTemplates.push({
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
    }

    // MEMBER - Limited access to specific areas
    const memberTabs = [
      'analytics', 'lead-management'
    ];
    
    for (const tab of allTabs) {
      if (memberTabs.includes(tab.categoryId) || (tab.categoryId === 'user-management' && tab.tabId === 'profile')) {
        const key = `MEMBER-${tab.categoryId}-${tab.tabId}`;
        if (!existingKeys.has(key)) {
          newTemplates.push({
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
    }

    // Create new templates if any
    let createdCount = 0;
    if (newTemplates.length > 0) {
      await prisma.permissionTemplate.createMany({
        data: newTemplates
      });
      createdCount = newTemplates.length;
    }

    return NextResponse.json({
      success: true,
      message: `Synced permission templates. Created ${createdCount} new templates.`,
      data: {
        templatesCreated: createdCount,
        existingTemplatesCount: existingTemplates.length,
        roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MEMBER', 'VIEWER'],
        categories: [...new Set(allTabs.map(t => t.categoryId))],
        tabs: allTabs.length
      }
    });
  } catch (error) {
    console.error('Sync templates error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync permission templates'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}