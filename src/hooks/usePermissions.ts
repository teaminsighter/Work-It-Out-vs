import { useState, useEffect } from 'react';

interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

interface UsePermissionsReturn {
  permissions: Record<string, Permission>;
  hasPermission: (categoryId: string, tabId: string, action?: 'view' | 'edit' | 'delete' | 'export') => boolean;
  loading: boolean;
  error: string | null;
  refetchPermissions: () => Promise<void>;
}

export function usePermissions(userId?: string): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    // For development mode, grant all permissions immediately
    if (process.env.NODE_ENV === 'development') {
      const fullPermissions: Permission = {
        canView: true,
        canEdit: true,
        canDelete: true,
        canExport: true
      };
      
      // Create permissions for all possible categories and tabs
      const allPermissions: Record<string, Permission> = {};
      const categories = ['analytics', 'lead-management', 'page-builder', 'tracking', 'ai-insights', 'integrations', 'user-management', 'system'];
      const tabs = [
        // Analytics tabs
        'overview', 'forms', 'leads', 'marketing', 'realtime', 'visitors',
        // Lead management tabs  
        'all-leads', 'lead-analysis', 'ab-testing', 'visitor-analysis', 'duplicates', 'reports',
        // Page builder tabs
        'landing-pages', 'templates',
        // Tracking tabs
        'datalayer', 'gtm-config', 'integrations', 'conversion-api', 'api-keys',
        // AI insights tabs
        'chatbot', 'auto-reports', 'recommendations', 'alerts',
        // Integrations tabs
        'google-ads', 'facebook-ads', 'ga4', 'webhooks',
        // User management tabs
        'profile', 'admin-users', 'permissions', 'activity-logs', 'activity-dashboard',
        // System tabs
        'general', 'api-config', 'solar-pricing', 'database', 'backup'
      ];
      
      categories.forEach(category => {
        tabs.forEach(tab => {
          allPermissions[`${category}.${tab}`] = fullPermissions;
        });
      });
      
      setPermissions(allPermissions);
      setLoading(false);
      return;
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/permissions/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch permissions');
      }

      setPermissions(result.data.permissionMap || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (
    categoryId: string,
    tabId: string,
    action: 'view' | 'edit' | 'delete' | 'export' = 'view'
  ): boolean => {
    const key = `${categoryId}.${tabId}`;
    const permission = permissions[key];

    if (!permission) {
      return false;
    }

    switch (action) {
      case 'view':
        return permission.canView;
      case 'edit':
        return permission.canEdit;
      case 'delete':
        return permission.canDelete;
      case 'export':
        return permission.canExport;
      default:
        return permission.canView;
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  return {
    permissions,
    hasPermission,
    loading,
    error,
    refetchPermissions: fetchPermissions,
  };
}