
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useForm } from '@/contexts/FormContext';
import { motion } from 'framer-motion';

const HeroB = () => {
  const { scrollToWizard } = useForm();

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-purple-400 via-blue-500 to-blue-600">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start min-h-screen pt-40 pb-12">
          
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
              Get Started
            </Button>
          </motion.div>
          
          <div className="relative h-full hidden md:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px rgba(96, 165, 250, 0.7)" }}
              >
                <Card className="p-4 bg-white/30 backdrop-blur-md border-white/40 shadow-lg w-80 h-40 absolute top-[-35%] left-[20%] rotate-[-10deg]">
                    <p className="font-semibold text-gray-800">Your Coverage</p>
                    <div className="space-y-2 mt-2">
                        <div className="h-3 bg-gray-200/70 rounded-full w-full"></div>
                        <div className="h-3 bg-gray-200/70 rounded-full w-5/6"></div>
                    </div>
                </Card>
              </motion.div>
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px rgba(45, 212, 191, 0.7)" }}
              >
                 <Card className="p-4 bg-teal-400/70 backdrop-blur-md border-white/70 shadow-xl w-60 h-24 absolute top-[5%] left-[55%] z-10">
                   <div className="h-3 bg-white/50 rounded-full w-full mt-2"></div>
                   <div className="h-3 bg-white/50 rounded-full w-3/4 mt-2"></div>
                </Card>
              </motion.div>
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px rgba(147, 197, 253, 0.7)" }}
              >
                <Card className="p-4 bg-white/30 backdrop-blur-md border-white/40 shadow-lg w-80 h-40 absolute bottom-[45%] right-0 translate-x-1/4 rotate-[8deg]">
                  <p className="font-semibold text-gray-800">Premium Details</p>
                  <div className="space-y-2 mt-2">
                      <div className="h-3 bg-gray-200/70 rounded-full w-full"></div>
                      <div className="h-3 bg-gray-200/70 rounded-full w-4/6"></div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroB;
