
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useForm } from '@/contexts/FormContext';
import { motion } from 'framer-motion';

const HeroB = () => {
  const { scrollToWizard } = useForm();

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
      
      <div 
        className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-purple-100 via-blue-100 to-transparent"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 65% 100%, 0% 100%)',
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[60vh] lg:min-h-[70vh] pt-24 pb-12">
          
          <motion.div 
            className="text-gray-800"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4">
              Smart insurance for your better family life
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
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
              <Card className="p-4 bg-white/60 backdrop-blur-md border-white/70 shadow-lg w-80 h-40 absolute top-1/4 left-0 -translate-x-1/4 rotate-[-10deg]">
                <p className="font-semibold">Your Coverage</p>
                <div className="space-y-2 mt-2">
                    <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-5/6"></div>
                </div>
              </Card>
               <Card className="p-4 bg-teal-400/70 backdrop-blur-md border-white/70 shadow-xl w-60 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                 <div className="h-3 bg-white/50 rounded-full w-full mt-2"></div>
                 <div className="h-3 bg-white/50 rounded-full w-3/4 mt-2"></div>
              </Card>
              <Card className="p-4 bg-white/60 backdrop-blur-md border-white/70 shadow-lg w-80 h-40 absolute bottom-1/4 right-0 translate-x-1/4 rotate-[8deg]">
                <p className="font-semibold">Premium Details</p>
                <div className="space-y-2 mt-2">
                    <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-4/6"></div>
                </div>
              </Card>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroB;
