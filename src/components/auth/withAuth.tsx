
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
      if (!loading && !isAuthenticated) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.replace('/auth/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    // This check is now safe because we wait for loading to be false
    // and isAuthenticated to be true.
    if (options.allowedRoles && user) {
        const userRole = (user as any).role;
        if (!options.allowedRoles.includes(userRole)) {
            // Redirect to a 'not-authorized' page or back to dashboard
            router.replace('/admin/dashboard'); 
            return (
                 <div className="flex h-screen items-center justify-center">
                    <p>You are not authorized to view this page.</p>
                </div>
            );
        }
    }
    
    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
