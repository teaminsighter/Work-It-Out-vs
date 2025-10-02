'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionWrapperProps {
  categoryId: string;
  tabId: string;
  action?: 'view' | 'edit' | 'delete' | 'export';
  userId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionWrapper = ({ 
  categoryId, 
  tabId, 
  action = 'view', 
  userId, 
  children, 
  fallback 
}: PermissionWrapperProps) => {
  const { hasPermission, loading } = usePermissions(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasPermission(categoryId, tabId, action)) {
    return fallback || (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-7V6a3 3 0 00-3-3H6a3 3 0 00-3 3v3a3 3 0 003 3h3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            You don't have permission to {action} this {tabId} section. 
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionWrapper;