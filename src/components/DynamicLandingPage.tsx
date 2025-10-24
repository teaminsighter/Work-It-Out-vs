'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from '@/contexts/FormContext';
import { LandingPageConfig } from '@/lib/pageManager';

// Dynamically import all components
const Hero = dynamic(() => import('@/components/Hero'));
const HeroHealth = dynamic(() => import('@/components/health/HeroHealth'));
const HeroIncome = dynamic(() => import('@/components/income/HeroIncome'));
// Note: HeroLife needs to be created as a simple component
const HeroLife = dynamic(() => import('@/components/Hero')); // Using Hero as fallback
const HeroNew = dynamic(() => import('@/components/HeroNew'));

const Insurers = dynamic(() => import('@/components/Insurers'));
const FinancialProtection = dynamic(() => import('@/components/FinancialProtection'));
const Services = dynamic(() => import('@/components/Services'));
const Benefits = dynamic(() => import('@/components/Benefits'));
const HowItWorks = dynamic(() => import('@/components/HowItWorks'));
const Testimonials = dynamic(() => import('@/components/Testimonials'));
const CTA = dynamic(() => import('@/components/CTA'));

const QuoteWizard = dynamic(() => import('@/components/quote/QuoteWizard'));
const QuoteWizardHealthNew = dynamic(() => import('@/components/quote/QuoteWizardHealthNew'));
const QuoteWizardIncome = dynamic(() => import('@/components/quote/QuoteWizardIncome'));
const QuoteWizardLife = dynamic(() => import('@/components/quote/QuoteWizardLife'));
const QuoteWizardNew = dynamic(() => import('@/components/quote/QuoteWizardNew'));


import { Skeleton } from '@/components/ui/skeleton';

interface DynamicLandingPageProps {
  config: LandingPageConfig;
  slug: string;
}

const componentMap: { [key: string]: React.ComponentType<any> } = {
  // Heroes
  Hero,
  HeroHealth,
  HeroIncome,
  HeroLife,
  HeroNew,
  
  // Sections
  Insurers,
  FinancialProtection,
  Services,
  Benefits,
  HowItWorks,
  Testimonials,
  CTA,
  
  // Forms/Wizards
  QuoteWizard,
  QuoteWizardHealthNew,
  QuoteWizardIncome,
  QuoteWizardLife,
  QuoteWizardNew,
};

export default function DynamicLandingPage({ config, slug }: DynamicLandingPageProps) {
  const { setQuoteWizardRef } = useForm();
  const quoteWizardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setQuoteWizardRef(quoteWizardRef);
    setIsLoading(false);
  }, [setQuoteWizardRef]);

  // Track page view
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/page-manager', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-analytics',
            pageId: config.id,
            analytics: {
              views: config.analytics.views + 1
            }
          })
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackView();
  }, [config.id, config.analytics.views]);

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

  // Render hero component
  const renderHero = () => {
    const HeroComponent = componentMap[config.components.hero.type];
    if (!HeroComponent) {
      console.warn(`Hero component ${config.components.hero.type} not found`);
      return null;
    }
    return <HeroComponent {...config.components.hero} />;
  };

  // Render form/wizard component
  const renderForm = () => {
    const FormComponent = componentMap[config.components.forms.type];
    if (!FormComponent) {
      console.warn(`Form component ${config.components.forms.type} not found`);
      return <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 mt-6"><Skeleton className="h-[400px] w-full" /></div>;
    }
    return <FormComponent {...config.components.forms} />;
  };

  // Render sections
  const renderSections = () => {
    return config.components.sections.map((sectionName: string, index: number) => {
      const SectionComponent = componentMap[sectionName];
      if (!SectionComponent) {
        console.warn(`Section component ${sectionName} not found`);
        return null;
      }
      return <SectionComponent key={`${sectionName}-${index}`} />;
    });
  };

  return (
    <main className="w-full text-foreground bg-white">
      {/* SEO Meta Tags - would be handled by Next.js Head in a real implementation */}
      
      <div ref={quoteWizardRef}>
        {/* Hero Section */}
        {renderHero()}
        
      </div>

      {/* Main Sections */}
      {renderSections()}

      {/* Form for all variants */}
      <div className="relative">
        {renderForm()}
      </div>
    </main>
  );
}

export { componentMap };