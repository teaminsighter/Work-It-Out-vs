
'use client';

import { Card } from '@/components/ui/card';
import { useForm } from '@/contexts/FormContext';
import { Home, Heart, Shield, Car, Umbrella, BookOpen, Plane, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const insuranceOptions = [
  { value: 'life', label: 'Life Insurance', icon: Heart, nextStepId: 'security-systems' },
  { value: 'general', label: 'General Insurance', icon: Umbrella, nextStepId: 'security-systems' },
  { value: 'home', label: 'Home Insurance', icon: Home, nextStepId: 'home-property-type' },
  { value: 'liability', label: 'Liability Insurance', icon: Layers, nextStepId: 'security-systems' },
  { value: 'car', label: 'Car Insurance', icon: Car, nextStepId: 'vehicle-type' },
  { value: 'education', label: 'Education Insurance', icon: BookOpen, nextStepId: 'security-systems' },
  { value: 'travel', label: 'Travel Insurance', icon: Plane, nextStepId: 'security-systems' },
  { value: 'health', label: 'Health Insurance', icon: Shield, nextStepId: 'security-systems' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const InsuranceCardsD = () => {
  const { handleAnswer } = useForm();

  const onOptionSelect = (value: string, nextStepId: string) => {
    handleAnswer('insuranceType', value, nextStepId);
  };
  
  const gridPositions = [
    "md:row-start-1 md:col-start-1", // Life
    "md:row-start-2 md:col-start-1", // General
    "md:row-start-1 md:col-start-2 md:row-span-2", // Home
    "md:row-start-3 md:col-start-2", // Liability
    "md:row-start-1 md:col-start-4", // Car
    "md:row-start-2 md:col-start-4", // Education
    "md:row-start-1 md:col-start-3", // Travel
    "md:row-start-3 md:col-start-4", // Health
  ];

  return (
    <section>
      <div className="container mx-auto px-4">
        <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-2 md:gap-3 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
          {insuranceOptions.map((option, index) => (
            <motion.div
              key={option.value}
              variants={itemVariants}
              className={cn("w-full h-full", gridPositions[index])}
            >
              <Card
                onClick={() => onOptionSelect(option.value, option.nextStepId)}
                className={cn(
                  'group flex flex-col items-center justify-center text-center p-2 md:p-3 aspect-square rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl',
                  option.value === 'home'
                    ? 'bg-teal-400 text-white'
                    : 'bg-white hover:bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'p-1 md:p-1.5 rounded-md mb-1 transition-colors',
                    option.value === 'home'
                      ? 'bg-white/20'
                      : 'bg-teal-100/30 group-hover:bg-teal-100/60'
                  )}
                >
                  <option.icon
                    className={cn(
                      'h-3 w-3 md:h-4 md:w-4 transition-colors',
                      option.value === 'home' ? 'text-white' : 'text-teal-500'
                    )}
                  />
                </div>
                <h3 className="font-semibold text-[10px] md:text-xs">{option.label}</h3>
              </Card>
            </motion.div>
          ))}
          
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 md:col-start-2 row-start-2 md:row-start-2 text-center px-4"
          >
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Get best insurance deals from us
              </h2>
              <p className="mt-1 text-xs md:text-sm leading-7 text-gray-600">
                  Best Insurance helps you to get the best insurance quotes fast and easily.
              </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default InsuranceCardsD;
