'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Map the AuthContext user ID to the database user ID
  // The AuthContext uses simple IDs ('1', '2') but database uses cuid IDs
  const getUserIdForDatabase = (authUserId: string | undefined) => {
    if (!authUserId) return undefined;
    
    // Map auth context IDs to database IDs
    const userIdMap: { [key: string]: string } = {
      '1': 'cmg5u2rf000005szq9ww95cdh', // admin@localpower.com (super admin)
      '2': 'cmg5u2rf100015szqwvmz2591'  // manager@localpower.com (admin)
    };
    
    return userIdMap[authUserId];
  };

  const databaseUserId = getUserIdForDatabase(user?.id);

  return <AdminDashboard userId={databaseUserId} />;
}