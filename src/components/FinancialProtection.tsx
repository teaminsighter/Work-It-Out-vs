
'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from '@/contexts/FormContext';

const FinancialProtection = () => {
  const { scrollToWizard } = useForm();
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="rounded-lg overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="https://placehold.co/600x400.png"
              alt="Family photo"
              width={600}
              height={400}
              className="w-full h-full object-cover"
              data-ai-hint="family photo"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-primary mb-2">
              IS YOUR FAMILY FINANCIALLY PROTECTED?
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 !leading-tight mb-4">
              Getting the right insurance deal has never been easier
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Life is unpredictable, but your family's financial security doesn't have to be. We provide clear, unbiased advice to help you find the perfect insurance policy, ensuring your loved ones are protected no matter what happens.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Peace of mind for your loved ones.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Secure your financial future.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Expert guidance every step of the way.</span>
              </li>
            </ul>
            <Button size="lg" onClick={scrollToWizard}>Compare Quotes</Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinancialProtection;
