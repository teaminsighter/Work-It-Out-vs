
'use client';

import { useEffect, useRef } from 'react';
import { useForm } from '@/contexts/FormContext';
import HeroC from '@/components/c/HeroC';
import InsuranceCardsC from '@/components/c/InsuranceCardsC';
import Insurers from '@/components/Insurers';
import FinancialProtection from '@/components/FinancialProtection';
import Services from '@/components/Services';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';

export default function CPage() {
  const { setQuoteWizardRef } = useForm();
  const quoteWizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuoteWizardRef(quoteWizardRef);
  }, [setQuoteWizardRef]);

  return (
      <main className="w-full text-foreground bg-white">
        <div className="relative">
          <HeroC />
          <div ref={quoteWizardRef} className="relative z-10 -mt-24 sm:-mt-32 md:-mt-64">
              <InsuranceCardsC />
          </div>
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
