
"use client";

import { useEffect, useState } from 'react';
import { useForm } from '@/contexts/FormContext';
import { getCoverageRecommendation } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';
import type { Question } from '@/types';
import { motion } from 'framer-motion';

interface CoverageRecommendationStepProps {
  question: Question;
}

type Recommendation = {
  recommendation: string;
  reasoning: string;
};

export default function CoverageRecommendationStep({ question }: CoverageRecommendationStepProps) {
  const { formData, handleAnswer } = useForm();
  const { toast } = useToast();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendation() {
      setIsLoading(true);
      const result = await getCoverageRecommendation(formData);
      if (result.success && result.data) {
        setRecommendation(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        // Auto-advance with a default if AI fails
        handleAnswer('coverage-level', 'comprehensive', question.nextStepId);
      }
      setIsLoading(false);
    }
    fetchRecommendation();
  }, [formData, toast, handleAnswer, question.nextStepId]);

  const onContinue = () => {
    // Save the recommended coverage level to form data
    const recommendedValue = recommendation?.recommendation.toLowerCase().includes('comprehensive') 
        ? 'comprehensive' 
        : recommendation?.recommendation.toLowerCase().includes('premium') 
        ? 'premium' 
        : 'basic';
    handleAnswer('coverageLevel', recommendedValue, question.nextStepId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-4 text-2xl font-bold">Analyzing your needs...</h2>
        <p className="mt-2 text-muted-foreground">Our AI is crafting the perfect plan for you.</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
          <p>Could not load recommendation.</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Lightbulb className="mb-4 h-12 w-12 text-accent" />
      <h2 className="text-2xl font-bold sm:text-3xl font-headline">Your AI-Powered Recommendation</h2>
      <Card className="mt-6 w-full text-left">
        <CardHeader>
          <CardTitle className="text-primary">{recommendation.recommendation}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{recommendation.reasoning}</p>
        </CardContent>
      </Card>
      <Button onClick={onContinue} size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
        Accept & Continue
      </Button>
    </motion.div>
  );
}
