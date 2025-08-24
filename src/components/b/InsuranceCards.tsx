
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
    handleAnswer('insuranceType', value, nextStepId);
  };

  const cardPositions = [
    { top: '0', left: '5%', rotation: '-3deg' },
    { top: '25%', left: '30%', rotation: '2deg' },
    { top: '50%', left: '10%', rotation: '-4deg' },
    { top: '75%', left: '35%', rotation: '3deg' },
  ];

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Start Your Insurance Journey
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                Select an insurance type below to begin. Best Insurance helps you to get the best insurance quotes fast and easily.
            </p>
        </div>
        <div className="relative h-[500px] max-w-lg mx-auto mt-20">
          
          {/* Decorative lines */}
          <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
            <path d="M120 80 C 180 100, 220 180, 280 200" stroke="#E5E7EB" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
            <path d="M300 210 C 250 230, 180 300, 200 320" stroke="#E5E7EB" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
            <path d="M220 330 C 280 350, 320 420, 380 440" stroke="#E5E7EB" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
          </svg>

          {insuranceOptions.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 50, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: cardPositions[index].rotation }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="absolute"
              style={{
                top: cardPositions[index].top,
                left: cardPositions[index].left,
                width: '60%',
              }}
            >
                <Card
                onClick={() => onOptionSelect(option.value, option.nextStepId)}
                className={cn(
                    'group relative text-center p-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl',
                    index % 2 === 0 ? 'bg-teal-400 text-white' : 'bg-white hover:bg-gray-50'
                )}
                >
                <div className="flex justify-center mb-4">
                    <div className={cn('p-3 rounded-full', index % 2 === 0 ? 'bg-white/20' : 'bg-teal-100/50')}>
                    <option.icon className={cn('h-8 w-8', index % 2 === 0 ? 'text-white' : 'text-teal-500')} />
                    </div>
                </div>
                <h3 className="font-semibold text-lg">{option.label}</h3>
                </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceCards;
