
'use client';

import { useState } from 'react';
import { useForm } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { Question } from '@/types';
import { motion } from 'framer-motion';
import { NumericFormat } from 'react-number-format';

interface SliderStepProps {
  question: Question;
}

export default function SliderStep({ question }: SliderStepProps) {
  const { handleAnswer, formData } = useForm();
  const { id, Icon, question: questionText, description, nextStepId, min = 0, max = 100, step = 1 } = question;
  
  const initialValue = formData[id] || min;
  const [value, setValue] = useState<number>(initialValue);

  const onContinue = () => {
    handleAnswer(id, value, nextStepId);
  };

  return (
    <div className="flex flex-col items-center text-center text-gray-800">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {Icon && <Icon className="mb-4 h-12 w-12 text-primary" />}
      </motion.div>
      <h2 className="text-2xl font-bold sm:text-3xl font-headline">{questionText}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}

      <div className="mt-8 w-full max-w-sm space-y-6 text-center">
        <div className="text-4xl font-bold text-primary">
          <NumericFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
        </div>
        <Slider
          defaultValue={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(values) => setValue(values[0])}
        />
        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}
