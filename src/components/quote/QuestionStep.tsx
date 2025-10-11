
"use client";

import type { Question } from '@/types';
import { useForm } from '@/contexts/FormContext';
import OptionCard from './OptionCard';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldQuestion } from 'lucide-react';
import Image from 'next/image';

interface QuestionStepProps {
  question: Question;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function QuestionStep({ question }: QuestionStepProps) {
  const { handleAnswer, formData } = useForm();
  const { id, Icon, title, question: questionText, description, options } = question;

  const onOptionSelect = (value: string, nextStepId?: string) => {
    handleAnswer(id, value, nextStepId);
  };

  const isGalleryView = id === 'insurance-type' || id === 'security-systems' || id === 'previous-claims' || id === 'coverage-level' || id === 'gender';
  const isWelcomeSpecialty = id === 'welcome-specialty';
  const isInsuranceType = id === 'insurance-type';

  const processedQuestion = questionText.replace('{{insuranceType}}', formData.insuranceType || 'insurance');

  return (
    <div className="flex flex-col items-center text-center text-gray-800">
      {title && <h1 className="text-2xl font-bold sm:text-3xl font-headline mb-2 text-purple-600/90">{title}</h1>}
      {title && description && <p className="text-muted-foreground text-sm mb-8">{description}</p>}
      <h2 className="text-base font-semibold sm:text-lg font-headline capitalize">{processedQuestion}</h2>
      {!title && description && <p className="mt-2 text-muted-foreground text-sm">{description}</p>}
      
      <motion.div 
        className={cn(
          "mt-6 w-full",
          isInsuranceType
            ? "flex flex-wrap justify-center gap-3 max-w-lg"
            : isGalleryView
            ? "flex flex-wrap justify-center gap-3 max-w-sm"
            : isWelcomeSpecialty
            ? "grid grid-cols-2 gap-3 max-w-sm"
            : "grid grid-cols-1 max-w-sm gap-3"
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options?.map((option, index) => (
          <OptionCard
            key={option.value}
            option={option}
            onClick={() => onOptionSelect(option.value, option.nextStepId)}
            className={cn(
              isInsuranceType
                ? "p-3 aspect-square text-xs sm:text-sm w-[calc(33.33%-0.75rem)]"
                : isGalleryView
                ? "p-3 aspect-square text-xs sm:text-sm w-[calc(33.33%-0.75rem)]"
                : isWelcomeSpecialty
                ? "aspect-auto" 
                : ""
            )}
          />
        ))}
      </motion.div>
      {isWelcomeSpecialty && (
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <ShieldCheck className="mr-1 h-3 w-3 text-green-500" />
          <span>100% Secure, and Free</span>
        </div>
      )}
    </div>
  );
}
