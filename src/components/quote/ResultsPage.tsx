"use client";

import { useForm } from '@/contexts/FormContext';
import { calculateQuote } from '@/lib/quote-engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { submitQuote } from '@/lib/actions';
import { useEffect } from 'react';

export default function ResultsPage() {
  const { formData } = useForm();
  const quote = calculateQuote(formData);

  useEffect(() => {
    // Submit the quote data to the backend when the results page loads.
    async function triggerSubmit() {
        await submitQuote(formData);
    }
    triggerSubmit();
  }, [formData]);


  const details = [
    { label: 'Insurance Type', value: formData.insuranceType },
    { label: 'Coverage Level', value: formData.coverageLevel },
    { label: 'Preferred Excess', value: formData.excessAmount },
    { label: 'Start Date', value: formData.coverageStartDate },
    { label: 'Contact Preference', value: formData.preferredContact },
  ].filter(d => d.value);

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <Gem className="h-16 w-16 text-primary" />
      </motion.div>

      <motion.h2 
        className="mt-6 text-3xl font-bold sm:text-4xl font-headline"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Your Personalized Quote is Ready!
      </motion.h2>

      <motion.p 
        className="mt-2 text-muted-foreground"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Based on your selections, here is your estimated monthly premium.
      </motion.p>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full"
      >
        <Card className="mt-8 w-full">
            <CardHeader className="items-center">
                <CardDescription>Your Estimated Premium</CardDescription>
                <CardTitle className="flex items-baseline text-5xl font-extrabold">
                    ${quote}
                    <span className="ml-2 text-xl font-medium text-muted-foreground">/ month</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-left">
                    <h3 className="mb-4 text-lg font-semibold text-center">Coverage Summary</h3>
                    <ul className="space-y-3">
                        {details.map(item => (
                            <li key={item.label} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{item.label}</span>
                                <Badge variant="secondary" className="capitalize">{item.value.replace(/[-_]/g, ' ')}</Badge>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="flex-col">
                <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500"/>
                    <span>Quote reference has been sent to {formData.email}.</span>
                </div>
            </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
