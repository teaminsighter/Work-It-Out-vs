
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FormProvider } from '@/contexts/FormContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'QuoteFlow Insurance',
  description: 'Get your insurance quote in minutes.',
};

const SiteLayout = ({ children }: { children: React.ReactNode }) => (
  <FormProvider>
    <Header />
    <div id="wizard-ref-parent">
      {children}
    </div>
    <Toaster />
    <Footer />
  </FormProvider>
);

function AppContent({ children }: { children: React.ReactNode }) {
  'use client';
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const LayoutComponent = isAdminPage ? React.Fragment : SiteLayout;

  return <LayoutComponent>{children}</LayoutComponent>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <AuthProvider>
              <AppContent>{children}</AppContent>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
