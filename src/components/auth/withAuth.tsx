
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect } from 'react';

type Role = 'super_admin' | 'admin' | 'analyst' | 'viewer';

interface WithAuthOptions {
  allowedRoles?: Role[];
}

export default function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const WithAuth = (props: P) => {
    const { user, loading, isAuthenticated, hasRole } = useAuth();
    const router = useRouter();
    const { allowedRoles } = options;

    useEffect(() => {
      if (loading) {
        return; // Don't do anything while loading
      }

      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !hasRole(allowedRoles)) {
          router.replace('/unauthorized');
          return;
        }
      }

      // Fallback for when user is null after loading and not redirected
      if (!user) {
        router.replace('/auth/login');
      }
    }, [isAuthenticated, loading, user, router, hasRole, allowedRoles]);

    if (loading || !isAuthenticated || !user) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    // Check roles after loading and authentication is confirmed
    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasRole(allowedRoles)) {
        // This will be handled by the useEffect, but we can show a loader
        // while redirecting.
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
      }
    }


    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
