
'use client';

import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.displayName || user?.email}!</h2>
        <p>This is your protected dashboard page.</p>
        <p>Your role is: <strong>{(user as any)?.role || 'N/A'}</strong></p>
      </div>
    </div>
  );
}

// Protect the dashboard page, only authenticated users can access it.
export default withAuth(DashboardPage);
