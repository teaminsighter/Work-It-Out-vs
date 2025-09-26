
'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from '@/contexts/FormContext';
import Hero from '@/components/Hero';
import Insurers from '@/components/Insurers';
import FinancialProtection from '@/components/FinancialProtection';
import Services from '@/components/Services';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import { Skeleton } from '@/components/ui/skeleton';

const QuoteWizard = dynamic(() => import('@/components/quote/QuoteWizard'), {
  loading: () => <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 mt-6"><Skeleton className="h-[400px] w-full" /></div>,
  ssr: false
});

export default function Home() {
  const { setQuoteWizardRef } = useForm();
  const quoteWizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuoteWizardRef(quoteWizardRef);
  }, [setQuoteWizardRef]);

  return (
      <main className="w-full text-foreground bg-white">
        <div ref={quoteWizardRef}>
          <Hero />
        </div>
        <Insurers />
        <FinancialProtection />
        <Services />
        <Benefits />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
  );
}
