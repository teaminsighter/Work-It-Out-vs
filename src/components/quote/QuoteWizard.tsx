
"use client";

import { useForm } from '@/contexts/FormContext';
import QuestionStep from './QuestionStep';
import ResultsPage from './ResultsPage';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import ContactForm from './ContactForm';
import SelectForm from './SelectForm';
import MultiSelectStep from './MultiSelectStep';
import SMSVerificationStep from './SMSVerificationStep';
import SliderStep from './SliderStep';

export default function QuoteWizard() {
  const { currentStepId, goBack, stepHistory, questions, isQuestionsLoading } = useForm();
  
  const currentQuestion = questions[currentStepId];
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

  if (isQuestionsLoading) {
    return (
      <div className="relative w-full max-w-xl mx-auto scale-75">
        <div className="relative rounded-xl border bg-card/90 text-card-foreground p-4 shadow-2xl backdrop-blur-sm sm:p-6 mt-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xl mx-auto scale-75">
      <div className="relative rounded-xl border bg-card/90 text-card-foreground p-4 shadow-2xl backdrop-blur-sm sm:p-6 mt-4">
        <div 
          key={currentStepId}
          className="transition-opacity duration-150 ease-in-out"
          style={{ opacity: 1 }}
        >
          {renderStep()}
        </div>

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
