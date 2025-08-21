"use client";

import { useForm } from '@/contexts/FormContext';
import { ALL_QUESTIONS } from '@/lib/questions';
import WelcomeStep from './WelcomeStep';
import QuestionStep from './QuestionStep';
import ResultsPage from './ResultsPage';
import ProgressBar from './ProgressBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function QuoteWizard() {
  const { currentStepId, goBack, stepHistory } = useForm();

  const currentQuestion = ALL_QUESTIONS[currentStepId];
  const isFirstStep = stepHistory.length <= 1;

  const renderStep = () => {
    if (currentStepId === 'start') {
      return <WelcomeStep />;
    }
    if (currentStepId === 'results') {
      return <ResultsPage />;
    }
    if (currentQuestion) {
      if (currentQuestion.component) {
        const Component = currentQuestion.component;
        return <Component question={currentQuestion} />;
      }
      return <QuestionStep key={currentStepId} question={currentQuestion} />;
    }
    return <div>Question not found.</div>;
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl">
        <AnimatePresence>
          {currentStepId !== 'start' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <ProgressBar />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepId}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, type: "tween" }}
            >
              <div className="rounded-xl border bg-card/80 p-6 shadow-lg glassmorphism sm:p-8">
                {renderStep()}
              </div>
            </motion.div>
          </AnimatePresence>

          {!isFirstStep && currentStepId !== 'results' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full sm:-left-12"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
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
    </div>
  );
}
