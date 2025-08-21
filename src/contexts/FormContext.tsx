"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { FormData, Question } from '@/types';
import { ALL_QUESTIONS, TOTAL_STEPS_ESTIMATE } from '@/lib/questions';
import { useToast } from "@/hooks/use-toast";

interface FormContextType {
  formData: FormData;
  stepHistory: string[];
  currentStepId: string;
  progress: number;
  totalSteps: number;
  handleAnswer: (questionId: string, value: any, nextStepId?: string) => void;
  goBack: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>({});
  const [stepHistory, setStepHistory] = useState<string[]>(['start']);
  const [totalSteps, setTotalSteps] = useState(TOTAL_STEPS_ESTIMATE);
  const { toast } = useToast();

  const currentStepId = useMemo(() => stepHistory[stepHistory.length - 1], [stepHistory]);

  const handleAnswer = (questionId: string, value: any, nextStepId?: string) => {
    const newFormData = { ...formData, [questionId]: value };
    
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
    if (stepHistory.length > 1) {
      setStepHistory(prev => prev.slice(0, -1));
    }
  };

  const progress = useMemo(() => {
    const currentStepIndex = stepHistory.length -1;
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
