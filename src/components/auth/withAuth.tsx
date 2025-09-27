
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
    const { user, loading } = useAuth();
    const router = useRouter();
    const { allowedRoles } = options;

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!user) {
      router.replace('/auth/login');
      return null;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = (user as any).role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.replace('/unauthorized'); // Or a custom 403 page
        return null;
      }
    }

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
