import { FormProvider } from '@/contexts/FormContext';
import Hero from '@/components/Hero';
import Insurers from '@/components/Insurers';
import FinancialProtection from '@/components/FinancialProtection';
import Services from '@/components/Services';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';

export default function Home() {
  return (
    <FormProvider>
      <main className="w-full text-foreground bg-gray-50">
        <Hero />
        <Insurers />
        <FinancialProtection />
        <Services />
        <Benefits />
        <HowItWorks />
        <Testimonials />
      </main>
    </FormProvider>
  );
}
