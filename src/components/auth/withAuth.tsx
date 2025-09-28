
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
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Only redirect if loading is finished and user is not authenticated.
      if (!loading && !isAuthenticated) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.replace('/auth/login');
      }
    }, [isAuthenticated, loading, router]);

    // While loading, show a spinner to prevent the content from flashing.
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    // If authenticated, render the component.
    if (isAuthenticated) {
        return <WrappedComponent {...props} />;
    }
    
    // If not loading and not authenticated, show a loader while redirecting.
    return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  };

  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
