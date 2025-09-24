
"use client";

import { useState } from 'react';
import type { Question } from '@/types';
import { useForm } from '@/contexts/FormContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface MultiSelectStepProps {
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

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
};

export default function MultiSelectStep({ question }: MultiSelectStepProps) {
  const { handleAnswer } = useForm();
  const { id, Icon, question: questionText, description, options, nextStepId } = question;
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (value: string) => {
    setSelected(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const onSubmit = () => {
    handleAnswer(id, selected, nextStepId);
  }

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
        className="mt-6 grid grid-cols-2 gap-3 max-w-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options?.map((option) => (
          <motion.button
            key={option.value}
            variants={itemVariants}
            onClick={() => toggleOption(option.value)}
            className={cn(
              'group relative w-full rounded-lg border-2 p-5 text-center shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'overflow-hidden text-card-foreground',
              'flex flex-col items-center justify-center',
              selected.includes(option.value) ? 'border-primary bg-primary/10' : 'border-border bg-white',
              'hover:border-primary hover:shadow-md'
            )}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center justify-center">
              {option.icon && <option.icon className="mb-2 h-6 w-6 text-primary sm:mb-2" />}
              <span className="font-semibold">{option.label}</span>
            </div>
            <div className={cn(
                "absolute bottom-0 left-0 h-1 w-full origin-left transform bg-primary transition-transform duration-300 ease-in-out",
                selected.includes(option.value) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            )}></div>
          </motion.button>
        ))}
      </motion.div>

      <Button onClick={onSubmit} size="lg" className="mt-8 w-full max-w-sm">
        Next
      </Button>
    </div>
  );
}
