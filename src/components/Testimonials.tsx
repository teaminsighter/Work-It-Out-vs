"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from 'framer-motion';
import { useForm } from '@/contexts/FormContext';

const stories = [
  {
    name: 'Sarah Thompson',
    location: 'Auckland',
    role: 'Young Professional',
    quote: "The process was incredibly simple and fast. I got a much better deal than I expected, and the advice was genuinely helpful. Work It Out saved me over $300 per year!",
    avatar: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/WhatsApp%20Image%202025-09-25%20at%2014.54.05%20(1).webp?alt=media&token=4b8ba3c2-b019-4870-a414-ee5eee50d451',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    metrics: [
      { value: '$300', label: 'saved annually' },
      { value: '15min', label: 'time taken' }
    ],
    tags: ['Health Insurance', 'First-time buyer']
  },
  {
    name: 'Mike Patterson',
    location: 'Wellington',
    role: 'Business Owner',
    quote: "Work It Out saved me hours of research. Their comparison tool is top-notch, and I feel confident I've got the right cover for my business and family.",
    avatar: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/WhatsApp%20Image%202025-09-25%20at%2014.57.25.webp?alt=media&token=e5c2bb48-bb63-45c5-9e3d-65c6165347c4',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50',
    metrics: [
      { value: '8hrs', label: 'research saved' },
      { value: '3', label: 'policies compared' }
    ],
    tags: ['Business Insurance', 'Family Coverage']
  },
  {
    name: 'Jessica Wilson',
    location: 'Christchurch',
    role: 'New Parent',
    quote: "Finding the right life insurance felt overwhelming, but Work It Out made it easy to understand our options. We now have complete peace of mind for our growing family.",
    avatar: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/WhatsApp%20Image%202025-09-25%20at%2014.57.25%20(2).webp?alt=media&token=1bfa0a75-4743-44a1-851f-32526fad0d84',
    gradient: 'from-green-500 to-teal-500',
    bgGradient: 'from-green-50 to-teal-50',
    metrics: [
      { value: '$500K', label: 'coverage secured' },
      { value: '20min', label: 'application time' }
    ],
    tags: ['Life Insurance', 'Family Protection']
  },
  {
    name: 'Tom Harrison',
    location: 'Dunedin',
    role: 'First-time Buyer',
    quote: "As someone new to insurance, the expert advice was invaluable. I found a great policy that fits my budget perfectly and covers everything I need.",
    avatar: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/WhatsApp%20Image%202025-09-25%20at%2014.57.26.webp?alt=media&token=72fb7682-e942-4a85-8af9-71efb50986b0',
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-50 to-orange-50',
    metrics: [
      { value: '$150', label: 'monthly premium' },
      { value: '100%', label: 'budget fit' }
    ],
    tags: ['Income Protection', 'Student Friendly']
  }
];

const Testimonials = () => {
  const { scrollToWizard } = useForm();
  const [activeStory, setActiveStory] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElement = sectionRef.current;
      if (!sectionElement) return;

      const rect = sectionElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= 0 && rect.bottom > windowHeight) {
        const scrolledDistance = Math.abs(rect.top);
        const totalScrollDistance = rect.height - windowHeight;
        const sectionProgress = Math.min(scrolledDistance / totalScrollDistance, 1);
        
        const totalSteps = stories.length + 1; // stories + CTA
        const currentStep = Math.floor(sectionProgress * totalSteps);
        
        if (currentStep >= stories.length) {
          setShowCTA(true);
          setActiveStory(stories.length - 1);
        } else {
          setShowCTA(false);
          setActiveStory(currentStep);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95 overflow-hidden"
      style={{ height: '400vh' }}
    >
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

      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex items-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Sticky Title */}
            <motion.div 
              className="text-white"
              style={{
                color: showCTA ? '#ffffff' : stories[activeStory] ? '#ffffff' : '#ffffff'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-purple-100/20 text-purple-100 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20"
              >
                <MessageCircle className="h-4 w-4" />
                Real Success Stories
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  How we helped real Kiwis
                </span>
              </h2>
              <p className="text-xl text-purple-100 max-w-xl">
                See how our personalized approach saved time, money, and stress for families across New Zealand
              </p>
            </motion.div>

            {/* Right Side - Dynamic Content */}
            <div className="relative">
              {showCTA ? (
                /* Final CTA */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20"
                >
                  <h3 className="text-3xl font-bold text-white mb-6">
                    Ready for your success story?
                  </h3>
                  <p className="text-purple-100 text-lg mb-8">
                    Join thousands of satisfied Kiwis who found their perfect insurance match
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={scrollToWizard}
                      size="lg"
                      className="bg-white text-purple-900 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold"
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
                  <p className="text-purple-200 mt-4 text-sm">
                    ✓ Takes 3 minutes  ✓ 100% free  ✓ No obligation
                  </p>
                </motion.div>
              ) : (
                /* Story Cards */
                <motion.div
                  key={activeStory}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`relative bg-gradient-to-br ${stories[activeStory]?.bgGradient} rounded-3xl p-8 shadow-2xl border border-white/50 backdrop-blur-sm`}
                >
                  {/* Quote Mark */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-2xl text-purple-600 font-bold">"</span>
                  </div>

                  {/* User Profile */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                      <AvatarImage src={stories[activeStory]?.avatar} alt={stories[activeStory]?.name} />
                      <AvatarFallback>{stories[activeStory]?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{stories[activeStory]?.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{stories[activeStory]?.location}</span>
                        <span className="text-sm text-purple-600 font-medium">{stories[activeStory]?.role}</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-6 h-6 bg-gradient-to-r ${stories[activeStory]?.gradient} rounded-full flex items-center justify-center`}>
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 leading-relaxed mb-6 text-lg italic">
                    "{stories[activeStory]?.quote}"
                  </blockquote>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    {stories[activeStory]?.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
                        <span className={`text-2xl font-bold bg-gradient-to-r ${stories[activeStory]?.gradient} bg-clip-text text-transparent`}>
                          {metric.value}
                        </span>
                        <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {stories[activeStory]?.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-white/80 text-gray-700 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
