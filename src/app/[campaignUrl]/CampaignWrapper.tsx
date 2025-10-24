'use client';

import { useEffect, useState } from 'react';
import { setCampaignCookies } from './actions';
import { FormProvider } from '@/contexts/FormContext';
import dynamic from 'next/dynamic';

// Dynamic imports with simple loading states
const TraumaPage = dynamic(() => import('../trauma/page'), { 
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded mx-auto mt-8 max-w-xl"></div>
});
const MortgagePage = dynamic(() => import('../mortgage/page'), { 
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded mx-auto mt-8 max-w-xl"></div>
});
const HealthPage = dynamic(() => import('../health/page'), { 
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded mx-auto mt-8 max-w-xl"></div>
});
const LifePage = dynamic(() => import('../life/page'), { 
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded mx-auto mt-8 max-w-xl"></div>
});
const HomePage = dynamic(() => import('../page'), { 
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded mx-auto mt-8 max-w-xl"></div>
});

interface CampaignWrapperProps {
  visitorId: string;
  campaignId: string;
  variantId: string;
  isNewAssignment: boolean;
  landingPageSlug: string;
}

export default function CampaignWrapper({ 
  visitorId, 
  campaignId, 
  variantId, 
  isNewAssignment,
  landingPageSlug
}: CampaignWrapperProps) {
  
  console.log('🎯 Campaign Wrapper Debug:', {
    visitorId,
    campaignId,
    variantId,
    isNewAssignment,
    landingPageSlug
  });

  useEffect(() => {
    if (isNewAssignment) {
      setCampaignCookies(visitorId, campaignId, variantId);
    }
  }, [isNewAssignment, visitorId, campaignId, variantId]);

  // Render the appropriate page component based on the landing page slug
  const renderPageComponent = () => {
    console.log('🔄 Rendering component for:', landingPageSlug);
    
    switch (landingPageSlug) {
      case '/trauma':
        console.log('✅ Rendering TraumaPage');
        return <TraumaPage />;
      case '/mortgage':
        console.log('✅ Rendering MortgagePage');
        return <MortgagePage />;
      case '/health':
        console.log('✅ Rendering HealthPage');
        return <HealthPage />;
      case '/life':
        console.log('✅ Rendering LifePage');
        return <LifePage />;
      case '/':
        console.log('✅ Rendering HomePage');
        return <HomePage />;
      default:
        console.log('⚠️ Fallback to HomePage for unknown slug:', landingPageSlug);
        return <HomePage />; // Fallback to home page
    }
  };

  // Wrap with FormProvider to provide the necessary context
  // Pass the landingPageSlug as overridePathname to ensure correct form context
  return (
    <FormProvider overridePathname={landingPageSlug}>
      {renderPageComponent()}
    </FormProvider>
  );
}