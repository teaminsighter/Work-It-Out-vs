'use client';

import { FileText, ClipboardList, ThumbsUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: FileText,
    title: 'Fill Out Form',
    description: 'Provide a few details about your insurance needs using our simple and secure online form.',
  },
  {
    icon: ClipboardList,
    title: 'We Compare',
    description: 'Our system instantly compares policies from over 50 top NZ insurers to find the best match.',
  },
  {
    icon: ThumbsUp,
    title: 'You Save',
    description: 'You get a transparent, no-obligation quote that could save you hundreds on your premium.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const HowItWorks = () => {
  return (
    <section 
      className="bg-white text-gray-900 py-16 sm:py-24"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 text-sm">ABOUT OUR PROCESS PROGRAMME</Badge>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            How It Works
          </motion.h2>
        </div>
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
        >
          {steps.map((step, index) => (
            <motion.div 
                key={index} 
                className="flex flex-col items-center relative z-10"
                variants={itemVariants}
            >
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <step.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="text-center mt-16">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            GET YOUR FREE QUOTE
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
