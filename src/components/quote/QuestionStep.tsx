"use client";

import type { Question } from '@/types';
import { useForm } from '@/contexts/FormContext';
import OptionCard from './OptionCard';
import { motion } from 'framer-motion';

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
        className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options?.map(option => (
          <OptionCard
            key={option.value}
            option={option}
            onClick={() => onOptionSelect(option.value, option.nextStepId)}
          />
        ))}
      </motion.div>
    </div>
  );
}
