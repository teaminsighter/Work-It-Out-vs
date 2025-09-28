
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleSignOut} variant="outline" size="sm">Sign Out</Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserCircle className="h-10 w-10 text-muted-foreground" />
            <div>
              <CardTitle>Welcome, {user?.displayName || user?.email}!</CardTitle>
              <CardDescription>You are successfully logged in.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p><span className="font-semibold">Email:</span> {user?.email}</p>
            <p><span className="font-semibold">Role:</span> <span className="capitalize bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">{(user as any)?.role || 'N/A'}</span></p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Protected Content</h2>
        <p>This is your protected dashboard page. Only authenticated users can see this.</p>
      </div>
    </div>
  );
}

// The dashboard page is now protected by the AdminLayout, so withAuth is no longer needed here.
export default DashboardPage;
