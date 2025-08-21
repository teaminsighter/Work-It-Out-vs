"use client";

import type { Question } from '@/types';
import { useForm } from '@/contexts/FormContext';
import OptionCard from './OptionCard';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import ProgressBar from './ProgressBar';

interface QuestionStepProps {
  question: Question;
  isWelcome?: boolean;
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

export default function QuestionStep({ question, isWelcome = false }: QuestionStepProps) {
  const { handleAnswer, setFormData, formData } = useForm();
  const { id, Icon, question: questionText, description, options, getNextStepId, nextStepId } = question;

  const onOptionSelect = (value: string) => {
    // If there is no continue button, transition immediately
    if (getNextStepId || nextStepId) {
        setFormData(prev => ({...prev, [id]: value }));
        handleAnswer(id, value);
    } else {
        // Otherwise, just store the value and wait for the continue button
        setFormData(prev => ({...prev, [id]: value }));
    }
  };
  
  const currentValue = formData[id];

  return (
    <div className="flex flex-col items-center text-center text-gray-800">
      {isWelcome && <ProgressBar isSimple />}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        {isWelcome ? (
            <>
                <h1 className="text-3xl font-bold text-[#2A81A8]">Get Your Free Quotes Now</h1>
                <p className="mt-2 text-muted-foreground">Compare Insurance Deals & Save</p>
            </>
        ) : (
            <Icon className="mb-4 h-12 w-12 text-primary" />
        )}
      </motion.div>
      <h2 className={cn("text-lg font-semibold mt-8", isWelcome && "text-[#2A81A8]")}>{questionText}</h2>
      {description && !isWelcome && <p className="mt-2 text-muted-foreground">{description}</p>}
      
      <motion.div 
        className="mt-6 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <RadioGroup onValueChange={onOptionSelect} value={currentValue} className="space-y-3">
            {options?.map(option => (
                <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={cn(
                        "flex items-center justify-between w-full rounded-lg border-2 p-4 text-left shadow-sm transition-all duration-200 cursor-pointer",
                        "bg-[#E9F5FA] border-[#CDE9F7]",
                        "hover:border-[#2A81A8]/50",
                        currentValue === option.value && "border-primary bg-primary/10"
                    )}
                >
                    <span className="font-semibold text-gray-700">{option.label}</span>
                    <RadioGroupItem value={option.value} id={option.value} />
                </Label>
            ))}
        </RadioGroup>
      </motion.div>
    </div>
  );
}
