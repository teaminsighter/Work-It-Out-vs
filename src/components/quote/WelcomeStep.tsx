"use client";

import { useForm } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomeStep() {
  const { handleAnswer } = useForm();

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <ShieldCheck className="h-20 w-20 text-primary" />
      </motion.div>
      <motion.h1 
        className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl font-headline"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Welcome to QuoteFlow
      </motion.h1>
      <motion.p 
        className="mt-4 max-w-md text-lg text-muted-foreground"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Get a personalized insurance quote in just a few minutes. Let's find the perfect cover for you.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8"
      >
        <Button
          size="lg"
          onClick={() => handleAnswer('start', 'go', 'insurance-type')}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}
