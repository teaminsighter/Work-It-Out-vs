
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { ComponentType } from 'react';

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

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      // In a real app, you might want to redirect to a login page
      if (typeof window !== 'undefined') {
        router.replace('/auth/login');
      }
      return null;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!user || !hasRole(allowedRoles)) {
        // Redirect to an unauthorized page if role is not allowed
        if (typeof window !== 'undefined') {
          router.replace('/unauthorized'); 
        }
        return null;
      }
    }
    
    // Fallback for when user is null after loading and not redirected
    if (!user) {
       if (typeof window !== 'undefined') {
        router.replace('/auth/login');
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
