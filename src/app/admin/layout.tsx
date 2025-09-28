
'use client';

import React, { useEffect } from 'react';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
import { useAuth } from '@/contexts/AuthContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { logout } from '@/lib/firebase/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await logout();
    router.push('/auth/login');
  };

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = pathname.startsWith(item.href);
      if (item.subitems) {
        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton isActive={isActive} icon={item.icon}>
              {item.label}
            </SidebarMenuButton>
            <SidebarMenuSub>
              {item.subitems.map((subitem) => {
                const isSubActive = pathname === subitem.href;
                return (
                  <SidebarMenuSubItem key={subitem.label}>
                    <SidebarMenuSubButton
                      href={subitem.href}
                      asChild
                      isActive={isSubActive}
                    >
                      <Link href={subitem.href}>{subitem.label}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </SidebarMenuItem>
        );
      } else {
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
      }
    });
  };

  const breadcrumbItems = pathname.split('/').filter(Boolean);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
          <SidebarMenu>{renderNavItems(adminNavItems)}</SidebarMenu>
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
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="sm:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.slice(1).map((item, index) => (
                  <React.Fragment key={item}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === breadcrumbItems.length - 2 ? (
                        <BreadcrumbPage className="capitalize">
                          {item.replace(/-/g, ' ')}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link
                            href={`/${breadcrumbItems
                              .slice(0, index + 2)
                              .join('/')}`}
                            className="capitalize"
                          >
                            {item.replace(/-/g, ' ')}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
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
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
