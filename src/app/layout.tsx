
'use client';

import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FormProvider } from '@/contexts/FormContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const LayoutComponent = isAdminPage ? React.Fragment : SiteLayout;

  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <title>QuoteFlow Insurance</title>
        <meta name="description" content="Get your insurance quote in minutes." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-sans antialiased', inter.variable)} suppressHydrationWarning>
        <LayoutComponent>
          {children}
        </LayoutComponent>
      </body>
    </html>
  );
}


const SiteLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <FormProvider>
      <Header />
      <div id="wizard-ref-parent">
        {children}
      </div>
      <Toaster />
      <Footer />
    </FormProvider>
  </AuthProvider>
);
