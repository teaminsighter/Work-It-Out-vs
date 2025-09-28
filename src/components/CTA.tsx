
'use client';

import { Button } from './ui/button';
import { useForm } from '@/contexts/FormContext';

const CTA = () => {
  const { scrollToWizard } = useForm();
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-primary mb-2">
            READY TO MAKE THE RIGHT CHOICE?
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 !leading-tight mb-4">
            Get The Best Insurance Deal
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Start your comparison now and join thousands of Kiwis who have found better coverage for less. It's fast, free, and there's no obligation.
          </p>
          <Button size="lg" className="bg-brand-purple hover:bg-brand-purple/90 text-white" onClick={scrollToWizard}>
            Compare Quotes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
