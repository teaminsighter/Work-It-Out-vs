
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

  const sliderPoints = 4;
  const points = Array.from({ length: sliderPoints }, (_, i) => {
    const position = (i / (sliderPoints - 1)) * 100;
    return (
      <div
        key={i}
        className="absolute h-2 w-2 rounded-full bg-gray-300"
        style={{ left: `calc(${position}% - 4px)` }}
      />
    );
  });

  return (
    <div className="flex flex-col items-center text-center text-gray-800">
      <h2 className="text-lg font-semibold sm:text-xl font-headline">{questionText}</h2>
      {description && <p className="mt-2 text-muted-foreground text-sm">{description}</p>}

      <div className="mt-8 w-full max-w-sm space-y-6 text-center">
        <div className="text-4xl font-bold text-primary">
          <NumericFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
        </div>
        <div className="relative pt-2">
            <Slider
              defaultValue={[value]}
              min={min}
              max={max}
              step={step}
              onValueChange={(values) => setValue(values[0])}
            />
            <div className="relative mt-2 flex items-center">{points}</div>
        </div>
        <Button onClick={onContinue} className="w-full bg-brand-purple text-white hover:bg-brand-purple/90">
          Continue
        </Button>
      </div>
    </div>
  );
}
