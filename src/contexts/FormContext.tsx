
"use client";

import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { FormData, Question } from '@/types';

import { useToast } from "@/hooks/use-toast";
import { campaignTracker } from '@/lib/campaign-tracker';

interface FormContextType {
  formData: FormData;
  stepHistory: string[];
  currentStepId: string;
  progress: number;
  totalSteps: number;
  questions: any;
  isQuestionsLoading: boolean;
  quoteWizardRef: React.RefObject<HTMLDivElement> | null;
  scrollToWizard: () => void;
  handleAnswer: (questionId: string, value: any, nextStepId?: string) => void;
  goBack: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setQuoteWizardRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const getQuestionSet = async (pathname: string) => {
  switch (pathname) {
    case '/life':
    case '/income': {
      const { ALL_QUESTIONS, TOTAL_STEPS_ESTIMATE } = await import('@/lib/questions-life');
      return { questions: ALL_QUESTIONS, totalSteps: TOTAL_STEPS_ESTIMATE };
    }
    case '/health': {
      const { ALL_QUESTIONS, TOTAL_STEPS_ESTIMATE } = await import('@/lib/questions-health');
      return { questions: ALL_QUESTIONS, totalSteps: TOTAL_STEPS_ESTIMATE };
    }
    case '/trauma': {
      const { ALL_QUESTIONS, TOTAL_STEPS_ESTIMATE } = await import('@/lib/questions-trauma');
      return { questions: ALL_QUESTIONS, totalSteps: TOTAL_STEPS_ESTIMATE };
    }
    case '/mortgage': {
      const { ALL_QUESTIONS, TOTAL_STEPS_ESTIMATE } = await import('@/lib/questions-mortgage');
      return { questions: ALL_QUESTIONS, totalSteps: TOTAL_STEPS_ESTIMATE };
    }
    default: {
      const { ALL_QUESTIONS, TOTAL_STEPS_ESTIMATE } = await import('@/lib/questions');
      return { questions: ALL_QUESTIONS, totalSteps: TOTAL_STEPS_ESTIMATE };
    }
  }
};


export const FormProvider: React.FC<{ 
  children: React.ReactNode;
  overridePathname?: string;
}> = ({ children, overridePathname }) => {
  const pathname = usePathname();
  const effectivePathname = overridePathname || pathname;
  
  const [questions, setQuestions] = useState<any>({});
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [initialTotalSteps, setInitialTotalSteps] = useState(10);
  
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { questions: loadedQuestions, totalSteps } = await getQuestionSet(effectivePathname);
        setQuestions(loadedQuestions);
        setInitialTotalSteps(totalSteps);
      } finally {
        setIsQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, [effectivePathname]);

  const isHealthPage = effectivePathname === '/health';
  const isLifePage = effectivePathname === '/life';
  const isIncomePage = effectivePathname === '/income';
  const isTraumaPage = effectivePathname === '/trauma';
  const isMortgagePage = effectivePathname === '/mortgage';
  const isSpecialtyPage = isHealthPage || isLifePage || isIncomePage || isTraumaPage || isMortgagePage;
  
  const getInitialFormData = () => {
    if (isHealthPage) return { insuranceType: 'health' };
    if (isLifePage) return { insuranceType: 'life' };
    if (isIncomePage) return { insuranceType: 'income' };
    if (isTraumaPage) return { insuranceType: 'trauma' };
    if (isMortgagePage) return { insuranceType: 'mortgage' };
    return {};
  };

  const getInitialStepHistory = () => {
    if (isSpecialtyPage) return ['welcome-specialty'];
    return ['insurance-type'];
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [stepHistory, setStepHistory] = useState<string[]>(getInitialStepHistory());
  const [totalSteps, setTotalSteps] = useState(initialTotalSteps);
  const [quoteWizardRef, setQuoteWizardRefState] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const [formStartedAt] = useState(new Date());
  const [formStepsData, setFormStepsData] = useState<any[]>([]);
  const { toast } = useToast();
  // Campaign tracking will be done through campaignTracker

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

  const submitFormData = async () => {
    const formType = pathname.slice(1) || 'main'; // health, life, income, etc.
    
    try {
      // Collect UTM parameters from URL or session storage
      const utmParams = {
        utmSource: new URLSearchParams(window.location.search).get('utm_source'),
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        utmContent: new URLSearchParams(window.location.search).get('utm_content'),
        utmKeyword: new URLSearchParams(window.location.search).get('utm_keyword'),
        gclid: new URLSearchParams(window.location.search).get('gclid'),
        fbclid: new URLSearchParams(window.location.search).get('fbclid'),
      };

      // Get visitor tracking data
      const visitorUserId = localStorage.getItem('visitorUserId') || `visitor_${Date.now()}`;
      
      // Calculate time to complete
      const timeToComplete = Math.floor((Date.now() - formStartedAt.getTime()) / 1000);

      const submissionData = {
        firstName: formData.name?.split(' ')[0] || formData.firstName || 'Unknown',
        lastName: formData.name?.split(' ').slice(1).join(' ') || formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        contactPreference: formData.contactPreference || 'EMAIL',
        formType,
        formData: formData,
        formSteps: formStepsData,
        timeToComplete,
        visitorUserId,
        ipAddress: null, // Can be set by server
        device: navigator.userAgent,
        firstVisitUrl: document.referrer || window.location.href,
        lastVisitUrl: window.location.href,
        ...utmParams
      };

      console.log('Submitting form data:', submissionData);

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Form submitted successfully:', result);
        
        // Track conversion for campaign analytics
        campaignTracker.trackConversion({
          metadata: {
            formType,
            email: formData.email,
            phone: formData.phone,
            timeToComplete,
            totalSteps: stepHistory.length
          }
        });
        
        toast({
          title: "Success!",
          description: "Your information has been submitted successfully.",
        });
        return true;
      } else {
        console.error('Form submission failed:', result);
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit form data.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAnswer = (questionId: string, value: any, nextStepId?: string) => {
    const newFormData = { ...formData };
    
    // Track this step data for detailed analytics
    const currentQuestion = questions[currentStepId];
    if (currentQuestion && questionId !== 'start') {
      const stepData = {
        stepId: questionId,
        questionText: currentQuestion.question,
        answerValue: typeof value === 'object' ? JSON.stringify(value) : value,
        answerText: currentQuestion.options?.find(opt => opt.value === value)?.label || value,
        timeOnStep: 30, // This could be tracked more precisely
        attemptCount: 1
      };
      setFormStepsData(prev => [...prev, stepData]);
    }
    
    if (typeof value === 'object' && value !== null) {
      Object.assign(newFormData, value);
    } else {
      newFormData[questionId] = value;
    }

    if (questionId === 'start' && value === 'go') {
        // Track form start for campaign analytics
        campaignTracker.trackPageView();
    } else if (questionId === 'insurance-type') {
      newFormData['insuranceType'] = value;
    } else if (questionId === 'security-systems') {
      newFormData['coverageType'] = value;
    }

    setFormData(newFormData);

    let nextStep: string | undefined = nextStepId;
    
    if (!nextStep) {
      const question = questions[currentStepId];
      if (question?.getNextStepId) {
        nextStep = question.getNextStepId(value, newFormData);
      } else if (question?.nextStepId) {
        nextStep = question.nextStepId
      } else if (question?.options) {
        const selectedOption = question.options.find(opt => opt.value === value);
        if (selectedOption?.nextStepId) {
            nextStep = selectedOption.nextStepId;
        }
      }
    }
    
    // Submit form data when moving to results page
    if (nextStep === 'results') {
      setTimeout(async () => {
        await submitFormData();
      }, 100); // Small delay to ensure state is updated
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
    questions,
    isQuestionsLoading,
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
