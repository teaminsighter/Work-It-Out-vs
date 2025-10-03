'use client';

import { useState, useRef } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Target, UserCheck, Shield, Star, Sparkles, Gift } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const benefits = [
  {
    icon: Target,
    title: 'Curated Shortlist',
    description: 'A handpicked selection of insurance options from top NZ insurers tailored to your needs',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    highlight: '50+ insurers compared'
  },
  {
    icon: UserCheck,
    title: 'Crystal Clear Explanations',
    description: 'No jargon. We break down coverage levels, waiting periods, and exclusions in plain English',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50',
    highlight: 'Easy to understand'
  },
  {
    icon: Shield,
    title: 'Best Value Focus',
    description: 'We highlight the best value options based on your priorities, not just the cheapest price',
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-50 to-orange-50',
    highlight: 'Value over price'
  },
  {
    icon: Star,
    title: 'Expert Guidance',
    description: 'Personal advice from licensed insurance advisers at no extra cost to you',
    gradient: 'from-green-500 to-teal-500',
    bgGradient: 'from-green-50 to-teal-50',
    highlight: 'Licensed advisers'
  },
  {
    icon: Gift,
    title: 'Zero Pressure',
    description: 'No obligation, no pushy sales tactics. Go at your own pace and make the right decision for you',
    gradient: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-50 to-purple-50',
    highlight: 'Your pace, your choice'
  },
  {
    icon: Sparkles,
    title: 'Ongoing Support',
    description: 'We\'re here when you need us most - during claims, renewals, and any questions that arise',
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50',
    highlight: 'Always available'
  },
];

const Benefits = () => {
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 py-16 sm:py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-10"
          animate={{ 
            y: [0, -40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-200 rounded-full opacity-15"
          animate={{ 
            y: [0, 30, 0],
            x: [0, 20, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(139,69,224,0.02)_50%,transparent_75%)] bg-[length:80px_80px]"></div>
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
            className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
            Your Benefits
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            What you get with us
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            More than just quotes – a complete insurance experience designed around you
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { 
                opacity: 1, 
                y: 0, 
                scale: 1 
              } : { 
                opacity: 0, 
                y: 50, 
                scale: 0.9 
              }}
              transition={{ 
                duration: 0.6, 
                delay: 0.1 + index * 0.1,
                type: "spring",
                bounce: 0.4
              }}
              className="group relative"
              onMouseEnter={() => setHoveredBenefit(index)}
              onMouseLeave={() => setHoveredBenefit(null)}
            >
              <motion.div
                className={`relative bg-gradient-to-br ${benefit.bgGradient} rounded-2xl p-8 h-full cursor-pointer border border-white/50 backdrop-blur-sm`}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px rgba(139, 69, 224, 0.15)",
                  scale: 1.02
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon */}
                <motion.div
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`p-4 bg-gradient-to-r ${benefit.gradient} rounded-full shadow-lg`}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4 text-center">
                  {benefit.description}
                </p>

                {/* Highlight Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  className={`flex justify-center`}
                >
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${benefit.gradient} text-white px-3 py-2 rounded-full text-sm font-medium`}>
                    <Star className="h-3 w-3" />
                    {benefit.highlight}
                  </div>
                </motion.div>

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-purple-300 rounded-full"
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
                  className="absolute bottom-6 right-6 w-1 h-1 bg-purple-400 rounded-full"
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

                {/* Hover overlay effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: hoveredBenefit === index ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
