"use client";

import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ResultsPage() {

  useEffect(() => {
    // Auto-redirect to first step after 5 seconds
    const timer = setTimeout(() => {
      window.location.reload();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRestartClick = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center text-center py-12">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <ShieldCheck className="h-20 w-20 text-green-500" />
      </motion.div>

      <motion.h2 
        className="mt-6 text-3xl font-bold sm:text-4xl font-headline text-gray-900"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Thank You!
      </motion.h2>

      <motion.p 
        className="mt-4 text-lg text-gray-600 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        We will contact you soon with your personalized insurance quote.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8"
      >
        <Button 
          onClick={handleRestartClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
        >
          Get Another Quote
        </Button>
      </motion.div>

      <motion.p 
        className="mt-4 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Automatically returning to start in 5 seconds...
      </motion.p>
    </div>
  );
}