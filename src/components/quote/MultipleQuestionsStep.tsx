"use client";

import type { Question } from '@/types';
import { useForm } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MultipleQuestionsStepProps {
  question: Question;
}

export default function MultipleQuestionsStep({ question }: MultipleQuestionsStepProps) {
  const { handleAnswer, formData } = useForm();
  const { id, Icon, question: questionText, description, multipleQuestions, nextStepId } = question;
  
  // Initialize state for each sub-question
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [allAnswered, setAllAnswered] = useState(false);

  // Check if all questions are answered
  useEffect(() => {
    if (multipleQuestions) {
      const requiredAnswers = multipleQuestions.length;
      const providedAnswers = Object.keys(answers).filter(key => answers[key]).length;
      setAllAnswered(requiredAnswers === providedAnswers);
    }
  }, [answers, multipleQuestions]);

  const handleSubAnswer = (subQuestionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [subQuestionId]: value
    }));
  };

  const handleSubmit = () => {
    if (allAnswered) {
      handleAnswer(id, answers, nextStepId);
    }
  };

  if (!multipleQuestions) {
    return <div>No multiple questions defined.</div>;
  }

  return (
    <div className="flex flex-col items-center text-center text-gray-800">
      <div className="mb-6">
        <Icon className="mx-auto h-12 w-12 text-purple-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{questionText}</h2>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>

      <div className="w-full space-y-6">
        {multipleQuestions.map((subQuestion, index) => (
          <motion.div
            key={subQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="font-medium text-lg mb-4 text-gray-900">
              {subQuestion.question}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {subQuestion.options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSubAnswer(subQuestion.id, option.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 font-medium
                    ${answers[subQuestion.id] === option.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 w-full">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`
            w-full py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-200
            ${allAnswered
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue
        </Button>
        
        {!allAnswered && (
          <p className="text-sm text-gray-500 mt-2">
            Please answer all questions to continue
          </p>
        )}
      </div>
    </div>
  );
}