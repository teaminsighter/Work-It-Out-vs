'use client';

import { useEffect, useState } from 'react';
import DynamicLandingPage from '@/components/DynamicLandingPage';
import { LandingPageConfig } from '@/lib/pageManager';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminControlledPageProps {
  pageId: string;
  slug: string;
  fallbackConfig?: Partial<LandingPageConfig>;
}

export default function AdminControlledPage({ pageId, slug, fallbackConfig }: AdminControlledPageProps) {
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // First try to load by slug
        const response = await fetch(`/api/page-manager?slug=${encodeURIComponent(slug)}`);
        const data = await response.json();
        
        if (data.page) {
          setConfig(data.page);
        } else {
          // Try to load by pageId
          const fallbackResponse = await fetch(`/api/page-manager?id=${pageId}`);
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.page) {
            setConfig(fallbackData.page);
          } else if (fallbackConfig) {
            // Use provided fallback
            setConfig({
              id: pageId,
              name: fallbackConfig.name || 'Landing Page',
              slug,
              status: fallbackConfig.status || 'published',
              analytics: { views: 0, conversions: 0, conversionRate: 0 },
              ...fallbackConfig
            } as LandingPageConfig);
          }
        }
      } catch (error) {
        console.error('Failed to load page config:', error);
        if (fallbackConfig) {
          setConfig({
            id: pageId,
            name: fallbackConfig.name || 'Landing Page',
            slug,
            status: fallbackConfig.status || 'published',
            analytics: { views: 0, conversions: 0, conversionRate: 0 },
            ...fallbackConfig
          } as LandingPageConfig);
        }
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [pageId, slug, fallbackConfig]);

  if (loading || !config) {
    return (
      <main className="w-full text-foreground bg-white">
        <div className="h-screen flex items-center justify-center">
          <Skeleton className="h-[400px] w-full max-w-4xl" />
        </div>
      </main>
    );
  }

  return <DynamicLandingPage config={config} slug={slug} />;
}