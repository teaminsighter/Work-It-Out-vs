
'use client';

import { useEffect, useRef } from 'react';
import { useForm } from '@/contexts/FormContext';
import HeroLife from '@/components/life/HeroLife';
import Insurers from '@/components/Insurers';
import FinancialProtection from '@/components/FinancialProtection';
import Services from '@/components/Services';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';

export default function LifePage() {
  const { setQuoteWizardRef } = useForm();
  const quoteWizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuoteWizardRef(quoteWizardRef);
  }, [setQuoteWizardRef]);

  return (
      <main className="w-full text-foreground bg-white">
        <div ref={quoteWizardRef}>
          <HeroLife />
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
