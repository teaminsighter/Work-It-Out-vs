
'use client';

import dynamic from 'next/dynamic';
import { ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useForm } from '@/contexts/FormContext';
import { Skeleton } from '@/components/ui/skeleton';

const QuoteWizardNew = dynamic(() => import('@/components/quote/QuoteWizardNew'), {
  loading: () => <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 mt-6"><Skeleton className="h-[400px] w-full" /></div>,
  ssr: false,
});


const HeroNew = () => {
  const { scrollToWizard, quoteWizardRef } = useForm();

  return (
    <section
      className="relative w-full pt-40 pb-16 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/Lanind%20Page%201%2Ffamily.jpeg?alt=media&token=424b8995-e4f0-4cf9-b257-623ca0287635')" }}
        data-ai-hint="insurance office"
      ></div>
      <div className="absolute inset-0 z-10 animated-gradient"></div>
      <div className="container mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4 text-shadow-lg">
              COMPARE NZ'S BEST INSURANCE DEALS IN 60 SECONDS
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 text-shadow">
              Get quick comparisons from leading NZ insurers and receive expert advice to find the perfect cover for you.
            </p>
            <ul className="space-y-3">
               <li className="flex items-center text-lg gap-3">
                <ShieldCheck className="h-6 w-6 text-white" />
                <span>We compare 50+ NZ insurers</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <ShieldCheck className="h-6 w-6 text-white" />
                <span>Get independent advice</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <ShieldCheck className="h-6 w-6 text-white" />
                <span>Trusted by thousands of Kiwis</span>
              </li>
            </ul>
          </div>
          <div ref={quoteWizardRef}>
            <QuoteWizardNew />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew;
