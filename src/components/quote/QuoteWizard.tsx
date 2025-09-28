
"use client";

import { useForm } from '@/contexts/FormContext';
import { ALL_QUESTIONS } from '@/lib/questions';
import { ALL_LOCATION_QUESTIONS } from '@/lib/questions-location';
import QuestionStep from './QuestionStep';
import ResultsPage from './ResultsPage';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CoverageRecommendationStep from './CoverageRecommendationStep';
import ContactForm from './ContactForm';
import SelectForm from './SelectForm';
import { usePathname } from 'next/navigation';
import MultiSelectStep from './MultiSelectStep';
import { ShieldCheck } from 'lucide-react';

const ALL_WIZARD_QUESTIONS = {...ALL_QUESTIONS, ...ALL_LOCATION_QUESTIONS};

export default function QuoteWizard() {
  const { currentStepId, goBack, stepHistory } = useForm();
  const pathname = usePathname();
  const isHealthPage = pathname === '/health';
  const isLifePage = pathname === '/life';
  const isIncomePage = pathname === '/income';

  const currentQuestion = ALL_WIZARD_QUESTIONS[currentStepId];
  const isSpecialPage = isHealthPage || isLifePage || isIncomePage;
  const isFirstStep = stepHistory.length <= (isSpecialPage ? 0 : 1);

  const renderStep = () => {
    if (currentStepId === 'results') {
      return <ResultsPage />;
    }
    if (currentQuestion) {
      if (currentQuestion.multiSelect) {
        return <MultiSelectStep question={currentQuestion} />;
      }
      if (currentQuestion.id === 'coverage-recommendation') {
        return <CoverageRecommendationStep question={currentQuestion} />;
      }
      if (currentQuestion.fields && currentQuestion.fields.length > 0) {
        return <ContactForm question={currentQuestion} />;
      }
      if (currentQuestion.field && currentQuestion.field === 'location') {
        return <SelectForm question={currentQuestion} />;
      }
      return <QuestionStep key={currentStepId} question={currentQuestion} />;
    }
    return <div>Question not found.</div>;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative rounded-xl border bg-card/90 text-card-foreground p-6 shadow-2xl backdrop-blur-sm sm:p-10 mt-6">
        {currentStepId !== 'results' && (
          <div className="text-center mb-6">
             <h1 className="text-xl font-bold tracking-tight sm:text-2xl font-headline">
                Compare Quotes from Top Insurers
            </h1>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepId}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, type: "tween" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {!isFirstStep && currentStepId !== 'results' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 hover:bg-white sm:-left-14"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </Button>
        )}
        {currentStepId === 'results' && (
          <div className="mt-6 flex justify-center">
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
