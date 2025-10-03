
'use client';

import { useRef } from 'react';
import { Button } from './ui/button';
import { useForm } from '@/contexts/FormContext';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Star, Target } from 'lucide-react';

const CTA = () => {
  const { scrollToWizard } = useForm();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95 py-16 sm:py-24 overflow-hidden"
    >
      {/* Animated Background Elements */}
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
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-indigo-400/15 rounded-full blur-xl"
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
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-purple-100/20 text-purple-100 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20"
          >
            <Target className="h-4 w-4" />
            Ready to Get Started?
          </motion.div>

          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Find your perfect insurance match
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join thousands of Kiwis who have found better coverage for less. Start your personalized comparison today.
          </motion.p>

          {/* Enhanced CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
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
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-6 text-purple-100"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-300" />
              <span className="text-sm">Takes 3 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-300" />
              <span className="text-sm">100% free service</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-300" />
              <span className="text-sm">No obligation</span>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
          >
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-purple-100 text-sm">Insurance providers compared</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-purple-100 text-sm">Happy customers served</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">$2M+</div>
              <div className="text-purple-100 text-sm">Saved for our customers</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
