'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Loader2,
} from 'lucide-react';
import { adminNavItems, NavItem } from '@/lib/admin-nav';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { FormProvider } from '@/contexts/FormContext';
import { logout } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push('/auth/login');
  };

  const activeTopLevelItem = adminNavItems.find(item => pathname.startsWith(item.href));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6" />
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    href={item.href}
                    asChild
                    isActive={isActive}
                    icon={item.icon}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.photoURL || ''}
                alt={user?.displayName || ''}
              />
              <AvatarFallback>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {user?.displayName || 'Admin User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {(user as any)?.role || 'Admin'}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:px-6">
           <SidebarTrigger className="sm:hidden" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.photoURL || ''}
                      alt={user?.displayName || ''}
                    />
                    <AvatarFallback>
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          {activeTopLevelItem && activeTopLevelItem.subitems && (
            <div className="border-b">
              <div className="px-4 sm:px-6">
                <h1 className="text-2xl font-bold py-4">{activeTopLevelItem.label}</h1>
                <nav className="flex space-x-4">
                  {activeTopLevelItem.subitems.map((subItem) => {
                    const isActive = pathname === subItem.href;
                    return (
                      <Link key={subItem.label} href={subItem.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "h-auto p-0 pb-2 rounded-none border-b-2",
                            isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                            "hover:bg-transparent"
                          )}
                        >
                          <subItem.icon className="mr-2 h-4 w-4" />
                          {subItem.label}
                        </Button>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          )}
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>

      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FormProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </FormProvider>
    </AuthProvider>
  );
}
