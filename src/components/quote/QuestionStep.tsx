
"use client";

import type { Question } from '@/types';
import { useForm } from '@/contexts/FormContext';
import OptionCard from './OptionCard';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const { handleAnswer } = useForm();
  const { id, Icon, question: questionText, description, options } = question;

  const onOptionSelect = (value: string, nextStepId?: string) => {
    handleAnswer(id, value, nextStepId);
  };

  const isGalleryView = id === 'insurance-type' || id === 'security-systems' || id === 'previous-claims' || id === 'coverage-level';
  const isInsuranceType = id === 'insurance-type';

  return (
    <div className="flex flex-col items-center text-center text-gray-800">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="mb-4 h-12 w-12 text-primary" />
      </motion.div>
      <h2 className="text-2xl font-bold sm:text-3xl font-headline">{questionText}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      
      <motion.div 
        className={cn(
          "mt-6 w-full",
          isInsuranceType
            ? "flex flex-wrap justify-center gap-3 max-w-md"
            : isGalleryView
            ? "flex flex-wrap justify-center gap-3 max-w-sm"
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
                : "",
              (id === 'previous-claims' || id === 'coverage-level') && option.value === 'yes' ? 'glass-green' : '',
              (id === 'previous-claims' || id === 'coverage-level') && option.value === 'no' ? 'glass-red' : ''
            )}
          />
        ))}
      </motion.div>
    </div>
  );
}
