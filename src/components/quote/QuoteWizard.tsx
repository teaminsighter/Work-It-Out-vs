"use client";

import { useForm } from '@/contexts/FormContext';
import { ALL_QUESTIONS } from '@/lib/questions';
import WelcomeStep from './WelcomeStep';
import QuestionStep from './QuestionStep';
import ResultsPage from './ResultsPage';
import ProgressBar from './ProgressBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, Star, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CoverageRecommendationStep from './CoverageRecommendationStep';
import ContactForm from './ContactForm';

export default function QuoteWizard() {
  const { currentStepId, goBack, stepHistory, handleAnswer, formData } = useForm();

  const currentQuestion = ALL_QUESTIONS[currentStepId];
  const isFirstStep = stepHistory.length <= 1;

  const renderStep = () => {
    if (currentStepId === 'start') {
        const firstQuestion = ALL_QUESTIONS['insurance-type'];
        return <QuestionStep key="insurance-type" question={firstQuestion} isWelcome={true} />;
    }
    if (currentStepId === 'results') {
      return <ResultsPage />;
    }
    if (currentQuestion) {
      if (currentQuestion.id === 'coverage-recommendation') {
        return <CoverageRecommendationStep question={currentQuestion} />;
      }
      if (currentQuestion.id === 'location' || currentQuestion.id === 'contact-details') {
        return <ContactForm question={currentQuestion} />;
      }
      return <QuestionStep key={currentStepId} question={currentQuestion} />;
    }
    return <div>Question not found.</div>;
  };
  
  const showContinue = currentQuestion && currentQuestion.options && formData[currentQuestion.id];
  
  const handleContinue = () => {
      if (currentQuestion && formData[currentQuestion.id]) {
          handleAnswer(currentQuestion.id, formData[currentQuestion.id]);
      }
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
       <div className="rounded-xl border bg-card/90 text-card-foreground p-6 pt-4 shadow-2xl backdrop-blur-sm sm:p-8 sm:pt-6">
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
                    {renderStep()}
                </motion.div>
                </AnimatePresence>

                {!isFirstStep && currentStepId !== 'results' && !showContinue &&(
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

            {showContinue && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-8"
                >
                    <Button onClick={handleContinue} size="lg" className="w-full bg-[#2A81A8] hover:bg-[#2A81A8]/90 text-white">
                        CONTINUE →
                    </Button>
                </motion.div>
            )}

            <div className="mt-8 text-center">
                <div className="flex justify-center items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Rated 4.8/5 by 1,200+ happy Kiwis</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                    <Lock className="h-4 w-4"/>
                    <span className="text-xs font-semibold tracking-wider">SECURE SSL ENCRYPTION</span>
                </div>
            </div>
       </div>
    </div>
  );
}
