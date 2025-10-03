
'use client';

import dynamic from 'next/dynamic';
import { Shield, Search, UserCheck, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useForm } from '@/contexts/FormContext';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const QuoteWizard = dynamic(() => import('@/components/quote/QuoteWizard'), {
  loading: () => <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 mt-6"><Skeleton className="h-[400px] w-full" /></div>,
  ssr: false,
});

const Hero = () => {
  const { scrollToWizard, quoteWizardRef } = useForm();

  return (
    <section className="relative w-full pt-40 pb-16 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/Lanind%20Page%201%2Ffamily.jpeg?alt=media&token=424b8995-e4f0-4cf9-b257-623ca0287635')" }}
        data-ai-hint="insurance office"
      />
      
      {/* Purple Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95 backdrop-blur-xl" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl"
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
          className="absolute -bottom-20 -right-20 w-60 h-60 bg-pink-400/20 rounded-full blur-xl"
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
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-indigo-400/15 rounded-full blur-xl"
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

      <div className="container mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start min-h-[400px]">
          <motion.div 
            className="text-white mt-0 md:mt-4 flex flex-col justify-start h-full pr-4 md:pr-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-purple-100/20 text-purple-100 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20"
            >
              <Sparkles className="h-4 w-4" />
              New Zealand's Premier Insurance Comparison
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4 text-shadow-lg text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Compare Insurance Quotes
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-purple-100 mb-8 text-shadow text-left max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Get quick comparisons from leading NZ insurers and receive expert advice to find the perfect cover for you and your family.
            </motion.p>
            
            <motion.ul 
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.li 
                className="flex items-center text-lg gap-3"
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 bg-green-500/20 rounded-full backdrop-blur-sm">
                  <Search className="h-5 w-5 text-green-400" />
                </div>
                <span>Compare 50+ leading NZ insurers</span>
              </motion.li>
              <motion.li 
                className="flex items-center text-lg gap-3"
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 bg-blue-500/20 rounded-full backdrop-blur-sm">
                  <UserCheck className="h-5 w-5 text-blue-400" />
                </div>
                <span>Get independent expert advice</span>
              </motion.li>
              <motion.li 
                className="flex items-center text-lg gap-3"
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 bg-purple-500/20 rounded-full backdrop-blur-sm">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <span>Trusted by thousands of Kiwis</span>
              </motion.li>
            </motion.ul>

            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={scrollToWizard}
                  size="lg"
                  className="bg-white text-purple-900 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
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
            </motion.div>
          </motion.div>
          
          <motion.div 
            ref={quoteWizardRef}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="backdrop-blur-sm bg-white/10 rounded-2xl p-1 shadow-2xl border border-white/20"
          >
            <QuoteWizard />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
