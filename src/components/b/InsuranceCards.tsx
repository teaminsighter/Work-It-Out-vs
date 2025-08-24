
'use client';

import { Card } from '@/components/ui/card';
import { useForm } from '@/contexts/FormContext';
import { Home, Heart, Shield, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const insuranceOptions = [
  { value: 'life', label: 'Life Insurance', icon: Heart, nextStepId: 'security-systems' },
  { value: 'health', label: 'Health Insurance', icon: Shield, nextStepId: 'security-systems' },
  { value: 'home', label: 'Home Insurance', icon: Home, nextStepId: 'home-property-type' },
  { value: 'vehicle', label: 'Car Insurance', icon: Car, nextStepId: 'vehicle-type' },
];

const InsuranceCards = () => {
  const { handleAnswer } = useForm();

  const onOptionSelect = (value: string, nextStepId: string) => {
    handleAnswer('insurance-type', value, nextStepId);
  };

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Get best insurance deals from us
                </h2>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                    Best Insurance helps you to get the best insurance quotes fast and easily.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {insuranceOptions.map((option, index) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <Card
                    onClick={() => onOptionSelect(option.value, option.nextStepId)}
                    className={cn(
                        'group relative text-center p-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl',
                        index === 2 ? 'bg-teal-400 text-white' : 'bg-white hover:bg-gray-50'
                    )}
                    >
                    <div className="flex justify-center mb-4">
                        <div className={cn('p-3 rounded-full', index === 2 ? 'bg-white/20' : 'bg-teal-100/50')}>
                        <option.icon className={cn('h-8 w-8', index === 2 ? 'text-white' : 'text-teal-500')} />
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg">{option.label}</h3>
                    </Card>
                </motion.div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default InsuranceCards;
