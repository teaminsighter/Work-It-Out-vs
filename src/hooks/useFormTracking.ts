'use client';

import { useRef, useCallback } from 'react';

interface FormTrackingOptions {
  formType: 'main' | 'life' | 'health' | 'income';
  stepNumber: number;
  stepName: string;
}

export const useFormTracking = (options: FormTrackingOptions) => {
  const stepStartTime = useRef<number>(Date.now());
  const currentStep = useRef<number>(options.stepNumber);

  // Get user tracking IDs
  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('visitor_user_id');
  };

  const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('visitor_session_id');
  };

  // Track form step entry
  const trackStepEntry = useCallback((questionId: string, questionText: string) => {
    stepStartTime.current = Date.now();
    currentStep.current = options.stepNumber;

    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) return;

    fetch('/api/track-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        formType: options.formType,
        stepNumber: options.stepNumber,
        stepName: options.stepName,
        questionId,
        questionText,
        isCompleted: false,
        isDropOff: false,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {}); // Silent fail
  }, [options]);

  // Track form answer
  const trackAnswer = useCallback((
    questionId: string, 
    questionText: string, 
    answerValue: string, 
    answerText?: string
  ) => {
    const timeOnStep = Math.floor((Date.now() - stepStartTime.current) / 1000);
    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) return;

    fetch('/api/track-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        formType: options.formType,
        stepNumber: options.stepNumber,
        stepName: options.stepName,
        questionId,
        questionText,
        answerValue,
        answerText,
        timeOnStep,
        isCompleted: false,
        isDropOff: false,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {}); // Silent fail
  }, [options]);

  // Track form completion
  const trackCompletion = useCallback((questionId: string, questionText: string) => {
    const timeOnStep = Math.floor((Date.now() - stepStartTime.current) / 1000);
    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) return;

    fetch('/api/track-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        formType: options.formType,
        stepNumber: options.stepNumber,
        stepName: options.stepName,
        questionId,
        questionText,
        timeOnStep,
        isCompleted: true,
        isDropOff: false,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {}); // Silent fail
  }, [options]);

  // Track form drop-off
  const trackDropOff = useCallback((questionId: string, questionText: string, reason?: string) => {
    const timeOnStep = Math.floor((Date.now() - stepStartTime.current) / 1000);
    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) return;

    fetch('/api/track-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        formType: options.formType,
        stepNumber: options.stepNumber,
        stepName: options.stepName,
        questionId,
        questionText,
        timeOnStep,
        isCompleted: false,
        isDropOff: true,
        answerText: reason,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {}); // Silent fail
  }, [options]);

  // Track interaction with form elements
  const trackInteraction = useCallback((eventType: string, elementData: any) => {
    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) return;

    fetch('/api/track-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        eventType: `form_${eventType}`,
        eventData: {
          ...elementData,
          formType: options.formType,
          stepNumber: options.stepNumber,
          stepName: options.stepName
        },
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {}); // Silent fail
  }, [options]);

  return {
    trackStepEntry,
    trackAnswer,
    trackCompletion,
    trackDropOff,
    trackInteraction
  };
};