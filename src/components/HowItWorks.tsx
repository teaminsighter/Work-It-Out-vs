
'use client';

import { useState, useRef } from 'react';
import { Search, Calculator, Handshake, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { motion, useInView } from 'framer-motion';
import { useForm } from '@/contexts/FormContext';

const steps = [
  {
    icon: Search,
    title: 'Tell us what you need',
    description: 'Answer a few simple questions about your insurance needs and preferences. Takes less than 3 minutes.',
    step: '01',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    decorativeColor: 'bg-purple-300'
  },
  {
    icon: Calculator,
    title: 'We compare & analyze',
    description: 'Our smart system compares 50+ insurance policies and identifies the best matches for your situation.',
    step: '02',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50',
    decorativeColor: 'bg-blue-300'
  },
  {
    icon: Handshake,
    title: 'Get personalized recommendations',
    description: 'Receive clear, jargon-free recommendations with transparent pricing and expert guidance.',
    step: '03',
    gradient: 'from-green-500 to-teal-500',
    bgGradient: 'from-green-50 to-teal-50',
    decorativeColor: 'bg-green-300'
  },
];

const HowItWorks = () => {
  const { scrollToWizard } = useForm();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95 text-white py-16 sm:py-24 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-400/20 rounded-full blur-xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/4 w-32 h-32 bg-indigo-400/15 rounded-full blur-xl"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-purple-100/20 text-purple-100 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20"
          >
            <Sparkles className="h-4 w-4" />
            Simple Process
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              How our insurance comparison works
            </span>
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Get the best insurance coverage in three simple steps. No hassle, no jargon, just results.
          </p>
        </motion.div>

        {/* Steps Grid with 3D Effects */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 80, rotateY: -15 }}
              animate={isInView ? { 
                opacity: 1, 
                y: 0, 
                rotateY: 0 
              } : { 
                opacity: 0, 
                y: 80, 
                rotateY: -15 
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2 + index * 0.2,
                type: "spring",
                bounce: 0.4
              }}
              className="group relative"
              style={{ perspective: "1000px" }}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <motion.div
                className={`relative bg-gradient-to-br ${step.bgGradient} rounded-3xl p-8 h-full cursor-pointer border border-white/50 backdrop-blur-sm`}
                whileHover={{ 
                  y: -15,
                  rotateY: 5,
                  rotateX: 5,
                  boxShadow: "0 30px 60px rgba(139, 69, 224, 0.2)"
                }}
                transition={{ duration: 0.4 }}
              >
                {/* Step Number */}
                <motion.div
                  className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
                  animate={{
                    rotate: hoveredStep === index ? 360 : 0
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-lg font-bold text-purple-600">{step.step}</span>
                </motion.div>

                {/* Icon */}
                <motion.div
                  className="flex justify-center mb-6 mt-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`p-4 bg-gradient-to-r ${step.gradient} rounded-full shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-center">
                  {step.description}
                </p>

                {/* Decorative Elements */}
                <motion.div
                  className={`absolute top-4 right-4 w-3 h-3 ${step.decorativeColor} rounded-full`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
                <motion.div
                  className={`absolute bottom-6 right-6 w-2 h-2 ${step.decorativeColor} rounded-full`}
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />

                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: hoveredStep === index ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Arrow connector (except for last step) */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-white text-purple-900 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold"
              onClick={scrollToWizard}
            >
              Compare now
              <motion.span
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Button>
          </motion.div>
          <p className="text-purple-100 mt-4 text-sm">
            ✓ Takes less than 3 minutes  ✓ 100% free  ✓ No obligation
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
