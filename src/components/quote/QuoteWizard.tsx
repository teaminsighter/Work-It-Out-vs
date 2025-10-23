
"use client";

import { useForm } from '@/contexts/FormContext';
import { ALL_QUESTIONS as ALL_MAIN_QUESTIONS } from '@/lib/questions';
import { ALL_QUESTIONS as ALL_LIFE_QUESTIONS } from '@/lib/questions-life';
import { ALL_QUESTIONS as ALL_HEALTH_QUESTIONS } from '@/lib/questions-health';
import { ALL_QUESTIONS as ALL_TRAUMA_QUESTIONS } from '@/lib/questions-trauma';
import { ALL_QUESTIONS as ALL_MORTGAGE_QUESTIONS } from '@/lib/questions-mortgage';
import { ALL_LOCATION_QUESTIONS } from '@/lib/questions-location';
import QuestionStep from './QuestionStep';
import ResultsPage from './ResultsPage';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ContactForm from './ContactForm';
import SelectForm from './SelectForm';
import { usePathname } from 'next/navigation';
import MultiSelectStep from './MultiSelectStep';
import SMSVerificationStep from './SMSVerificationStep';
import SliderStep from './SliderStep';

const getQuestionSet = (pathname: string) => {
  if (pathname === '/life') return { ...ALL_LIFE_QUESTIONS, ...ALL_LOCATION_QUESTIONS };
  if (pathname === '/health') return { ...ALL_HEALTH_QUESTIONS, ...ALL_LOCATION_QUESTIONS };
  if (pathname === '/income') return { ...ALL_LIFE_QUESTIONS, ...ALL_LOCATION_QUESTIONS };
  if (pathname === '/trauma') return { ...ALL_TRAUMA_QUESTIONS, ...ALL_LOCATION_QUESTIONS };
  if (pathname === '/mortgage') return { ...ALL_MORTGAGE_QUESTIONS, ...ALL_LOCATION_QUESTIONS };
  return { ...ALL_MAIN_QUESTIONS, ...ALL_LOCATION_QUESTIONS };
};

export default function QuoteWizard() {
  const { currentStepId, goBack, stepHistory } = useForm();
  const pathname = usePathname();
  
  const ALL_WIZARD_QUESTIONS = getQuestionSet(pathname);
  const currentQuestion = ALL_WIZARD_QUESTIONS[currentStepId];
  const isFirstStep = stepHistory.length <= 1;

  const renderStep = () => {
    if (currentStepId === 'results') {
      return <ResultsPage />;
    }
    if (currentStepId === 'sms-verification') {
      return <SMSVerificationStep question={currentQuestion} />;
    }
    if (currentQuestion) {
      if (currentQuestion.multiSelect) {
        return <MultiSelectStep question={currentQuestion} />;
      }
      if (currentQuestion.sliderField) {
        return <SliderStep question={currentQuestion} />;
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
    <div className="relative w-full max-w-xl mx-auto scale-75">
      <div className="relative rounded-xl border bg-card/90 text-card-foreground p-4 shadow-2xl backdrop-blur-sm sm:p-6 mt-4">
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
