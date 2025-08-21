"use client";

import { useForm } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomeStep() {
  const { handleAnswer } = useForm();

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 text-gray-800">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <ShieldCheck className="h-16 w-16 text-primary" />
      </motion.div>
      <motion.h1 
        className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl font-headline"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Get Your Free Quote
      </motion.h1>
      <motion.p 
        className="mt-2 max-w-md text-base text-muted-foreground"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Answer a few simple questions to receive your personalised quote in minutes.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6 w-full"
      >
        <Button
          size="lg"
          onClick={() => handleAnswer('start', 'go', 'insurance-type')}
          className="w-full"
        >
          Start My Quote
        </Button>
      </motion.div>
    </div>
  );
}
