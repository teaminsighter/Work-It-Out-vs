
"use client";

import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { FormData, Question } from '@/types';
import { ALL_QUESTIONS, TOTAL_STEPS_ESTIMATE } from '@/lib/questions';
import { useToast } from "@/hooks/use-toast";

interface FormContextType {
  formData: FormData;
  stepHistory: string[];
  currentStepId: string;
  progress: number;
  totalSteps: number;
  quoteWizardRef: React.RefObject<HTMLDivElement> | null;
  scrollToWizard: () => void;
  handleAnswer: (questionId: string, value: any, nextStepId?: string) => void;
  goBack: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setQuoteWizardRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isHealthPage = pathname === '/health';
  const isLifePage = pathname === '/life';
  const isIncomePage = pathname === '/income';
  const isSpecialtyPage = isHealthPage || isLifePage || isIncomePage;
  
  const getInitialFormData = () => {
    if (isHealthPage) return { insuranceType: 'health' };
    if (isLifePage) return { insuranceType: 'life' };
    if (isIncomePage) return { insuranceType: 'income' };
    return {};
  };

  const getInitialStepHistory = () => {
    if (isSpecialtyPage) return ['welcome-specialty'];
    return ['insurance-type'];
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [stepHistory, setStepHistory] = useState<string[]>(getInitialStepHistory());
  const [totalSteps, setTotalSteps] = useState(TOTAL_STEPS_ESTIMATE);
  const [quoteWizardRef, setQuoteWizardRefState] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const { toast } = useToast();

  const currentStepId = useMemo(() => stepHistory[stepHistory.length - 1], [stepHistory]);

  const setQuoteWizardRef = (ref: React.RefObject<HTMLDivElement>) => {
    setQuoteWizardRefState(ref);
  }

  const scrollToWizard = () => {
    quoteWizardRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if(stepHistory.length > 0 && stepHistory[0] !== 'insurance-type' && !isSpecialtyPage) {
         setStepHistory(['insurance-type']);
    }
  };

  const handleAnswer = (questionId: string, value: any, nextStepId?: string) => {
    const newFormData = { ...formData };
    
    if (typeof value === 'object' && value !== null) {
      Object.assign(newFormData, value);
    } else {
      newFormData[questionId] = value;
    }

    if (questionId === 'start' && value === 'go') {
        // Just moving to the first question, no data to set yet
    } else if (questionId === 'insurance-type') {
      newFormData['insuranceType'] = value;
    }

    setFormData(newFormData);

    let nextStep: string | undefined = nextStepId;
    
    if (!nextStep) {
      const question = ALL_QUESTIONS[currentStepId];
      if (question?.getNextStepId) {
        nextStep = question.getNextStepId(value);
      } else if (question?.nextStepId) {
        nextStep = question.nextStepId
      } else if (question?.options) {
        const selectedOption = question.options.find(opt => opt.value === value);
        if (selectedOption?.nextStepId) {
            nextStep = selectedOption.nextStepId;
        }
      }
    }
    
    if (nextStep) {
      setStepHistory(prev => [...prev, nextStep!]);
    } else {
       toast({
        title: "End of the line!",
        description: "There's no next step defined.",
        variant: "destructive"
      });
    }
  };

  const goBack = () => {
    const initialStep = isSpecialtyPage ? 'welcome-specialty' : 'insurance-type';
    if (stepHistory.length > 1) {
        if(currentStepId === initialStep) return;
        setStepHistory(prev => prev.slice(0, -1));
    }
  };

  const progress = useMemo(() => {
    const currentStepIndex = stepHistory.length;
    if (currentStepId === 'results') return 100;
    return Math.min(99, Math.round((currentStepIndex / totalSteps) * 100));
  }, [stepHistory.length, totalSteps, currentStepId]);

  const value = {
    formData,
    setFormData,
    stepHistory,
    currentStepId,
    progress,
    totalSteps,
    handleAnswer,
    goBack,
    quoteWizardRef,
    setQuoteWizardRef,
    scrollToWizard,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
