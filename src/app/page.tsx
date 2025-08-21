import { FormProvider } from '@/contexts/FormContext';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <FormProvider>
      <main className="w-full text-foreground bg-gray-50">
        <Hero />
      </main>
    </FormProvider>
  );
}
