
'use client';

import { useEffect, useState } from 'react';
import DynamicLandingPage from '@/components/DynamicLandingPage';
import { LandingPageConfig } from '@/lib/pageManager';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/page-manager?slug=/');
        const data = await response.json();
        
        if (data.page) {
          setConfig(data.page);
        } else {
          // Fallback to default main page config
          const fallbackResponse = await fetch('/api/page-manager?id=main');
          const fallbackData = await fallbackResponse.json();
          setConfig(fallbackData.page);
        }
      } catch (error) {
        console.error('Failed to load page config:', error);
        // Load fallback config
        setConfig({
          id: 'main',
          name: 'Main Landing Page',
          slug: '/',
          status: 'published',
          components: {
            hero: {
              type: 'Hero',
              title: 'Get Your Insurance Quote',
              subtitle: 'Compare plans and get the best deal in minutes',
              buttonText: 'Get Free Quote'
            },
            sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
            forms: {
              type: 'QuoteWizard',
              fields: ['name', 'email', 'phone']
            },
            seo: {
              title: 'Get Your Insurance Quote - Work It Out',
              description: 'Get your insurance quote in minutes.'
            }
          },
          analytics: { views: 0, conversions: 0, conversionRate: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (loading || !config) {
    return (
      <main className="w-full text-foreground bg-white">
        <div className="h-screen flex items-center justify-center">
          <Skeleton className="h-[400px] w-full max-w-4xl" />
        </div>
      </main>
    );
  }

  return <DynamicLandingPage config={config} slug="/" />;
}
