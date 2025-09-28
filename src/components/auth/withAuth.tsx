
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
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.replace('/auth/login');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !hasRole(allowedRoles)) {
          // This check is important. It's possible the user object with roles is not yet available.
          // However, if we are past the loading stage and still no user/role, then redirect.
           if (!user) {
             router.replace('/auth/login');
           } else {
             // User exists but doesn't have the role
             router.replace('/unauthorized'); // A page to show "Access Denied"
           }
          return;
        }
      }

    }, [isAuthenticated, loading, user, router, hasRole, allowedRoles]);

    if (loading || !isAuthenticated) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    // After loading and authentication is confirmed, check roles.
    // This second check handles the case where user data arrives after the initial check.
    if (allowedRoles && allowedRoles.length > 0) {
      if (!user || !hasRole(allowedRoles)) {
        // If still no user or role, show a loader while useEffect redirects.
        // This prevents a flash of the component before redirecting.
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
      }
    }

    // If we've made it here, the user is authenticated and has the correct role.
    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
