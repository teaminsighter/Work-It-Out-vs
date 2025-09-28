
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
      // Don't do anything while loading. Let the loader render.
      if (loading) {
        return;
      }

      // If not loading and not authenticated, redirect to login.
      if (!isAuthenticated) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.replace('/auth/login');
        return;
      }

      // If authenticated, but roles are required and the user doesn't have the correct one.
      if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        router.replace('/unauthorized'); // A page to show "Access Denied"
        return;
      }

    }, [isAuthenticated, loading, user, router, hasRole, allowedRoles]);


    // While loading, or if the user is not yet authenticated (and useEffect is about to redirect), show a loader.
    if (loading || !isAuthenticated) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    // If roles are required, do a final check after loading to prevent flashing the component
    // before the redirect in useEffect can run.
    if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
      // This loader will be shown briefly while the useEffect above redirects.
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    // If we've made it here, the user is authenticated and has the correct role.
    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
