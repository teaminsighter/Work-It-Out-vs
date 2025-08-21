import { FormProvider } from '@/contexts/FormContext';
import QuoteWizard from '@/components/quote/QuoteWizard';

export default function Home() {
  return (
    <FormProvider>
      <main className="min-h-dvh w-full bg-background font-body text-foreground">
        <QuoteWizard />
      </main>
    </FormProvider>
  );
}
