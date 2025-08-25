
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useForm } from '@/contexts/FormContext';
import { motion } from 'framer-motion';
import { Home, Heart, Shield, Car, Umbrella, BookOpen, Plane, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const gridPositions = [
    "md:row-start-1 md:col-start-1", // Life
    "md:row-start-2 md:col-start-1", // General
    "md:row-start-1 md:col-start-2 md:row-span-2", // Home
    "md:row-start-3 md:col-start-1", // Liability 
    "md:row-start-1 md:col-start-4", // Car
    "md:row-start-2 md:col-start-4", // Education
    "md:row-start-3 md:col-start-2", // Travel
    "md:row-start-1 md:col-start-3", // Health
  ];


const HeroD = () => {
  const { scrollToWizard, handleAnswer } = useForm();
    
  const onOptionSelect = (value: string, nextStepId: string) => {
    handleAnswer('insuranceType', value, nextStepId);
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-purple-400 via-blue-500 to-blue-600">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-screen pt-40 pb-12">
          
          <motion.div 
            className="text-white"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4 text-shadow-lg">
              Smart insurance for your better family life
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg">
              Best Insurance helps you to get the best insurance quotes fast and easily.
            </p>
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white rounded-full" onClick={scrollToWizard}>
              Get Quote Now
            </Button>
          </motion.div>
          
          <div className="relative h-full w-full flex items-center justify-center">
            <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-2 md:gap-3 items-center w-full"
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
                      'bg-white hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'p-1 md:p-1.5 rounded-md mb-1 transition-colors',
                        'bg-teal-100/30 group-hover:bg-teal-100/60'
                      )}
                    >
                      <option.icon
                        className={cn(
                          'h-3 w-3 md:h-4 md:w-4 transition-colors',
                           'text-teal-500'
                        )}
                      />
                    </div>
                    <h3 className="font-semibold text-[10px] md:text-xs text-gray-800">{option.label}</h3>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroD;
