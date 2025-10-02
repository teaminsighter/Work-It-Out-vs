'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from '@/contexts/FormContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Check, Users, FileText, ThumbsUp, XCircle, Lightbulb, DollarSign, Heart, Activity, TrendingUp, Shield, Clock, BarChart3, ArrowUpDown } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Insurers from '@/components/Insurers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const QuoteWizardHealthNew = dynamic(() => import('@/components/quote/QuoteWizardHealthNew'), {
  loading: () => <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 mt-6"><Skeleton className="h-[400px] w-full" /></div>,
  ssr: false,
});

const HealthPageHero = () => {
  const { quoteWizardRef } = useForm();
  return (
    <section className="relative w-full pt-40 pb-16 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/Lanind%20Page%201%2Ffamily.jpeg?alt=media&token=424b8995-e4f0-4cf9-b257-623ca0287635')" }}
        data-ai-hint="healthy family"
      ></div>
      <div className="absolute inset-0 bg-primary/70"></div>
      <div className="container mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4 text-shadow-lg">
              Compare Health Insurance Quotes
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-xl text-shadow">
              Find the right health cover for you and your family. Compare plans from leading NZ providers and get expert guidance.
            </p>
            <ul className="space-y-3">
               <li className="flex items-center text-lg gap-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Compare top NZ health insurers</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>No obligation, completely free</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Takes about 3–4 minutes</span>
              </li>
            </ul>
          </div>
          <div ref={quoteWizardRef}>
            <QuoteWizardHealthNew />
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyCompareSection = () => {
  const { scrollToWizard } = useForm();
  const [activeSection, setActiveSection] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const sections = [
    {
      title: "Same cover, different price.",
      description: "Providers rate occupation, health, and age differently. A quick comparison can shave dollars off your monthly premium.",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Benefit periods matter.",
      description: "Two 'income protection' quotes can behave very differently — think short-term vs long-term benefits, waiting periods, and claim definitions.",
      icon: Activity,
      color: "text-purple-600"
    },
    {
      title: "Your career changes.",
      description: "New job, salary increase, lifestyle change — your cover should adapt with you, not hold you back.",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElement = sectionRef.current;
      if (!sectionElement) return;

      const rect = sectionElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if section is in the viewport
      if (rect.top <= 0 && rect.bottom > windowHeight) {
        // Calculate how far we've scrolled through this section
        const scrolledDistance = Math.abs(rect.top);
        const totalScrollDistance = rect.height - windowHeight;
        const sectionProgress = Math.min(scrolledDistance / totalScrollDistance, 1);
        
        // Calculate which section should be active based on scroll progress
        const newActiveSection = Math.min(Math.floor(sectionProgress * sections.length), sections.length - 1);
        
        if (newActiveSection !== activeSection) {
          setActiveSection(newActiveSection);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, sections.length]);

  return (
    <>
      {/* Sticky Scroll Section */}
      <div 
        ref={sectionRef} 
        className="relative"
        style={{ height: `300vh` }} // 3x viewport height for scroll space
      >
        <div className="sticky top-0 h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20"
              animate={{ 
                y: [0, -50, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20"
              animate={{ 
                y: [0, 30, 0],
                scale: [1.2, 1, 1.2]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="h-screen flex flex-col relative z-10">
            {/* Fixed Header at Top */}
            <div className="container mx-auto px-4 pt-16 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-black">
                  Why compare health insurance quotes before you decide
                </h2>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-center">
                  {/* Left Side - All Titles Visible */}
                  <div className="space-y-8">
                    {sections.map((section, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-6 cursor-pointer"
                        animate={{
                          opacity: activeSection === index ? 1 : 0.4
                        }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setActiveSection(index)}
                      >
                        <motion.div 
                          className={`p-4 rounded-2xl transition-all duration-300`}
                          animate={{
                            backgroundColor: activeSection === index ? '#9333ea' : '#e5e7eb',
                            scale: activeSection === index ? 1.05 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <section.icon 
                            className={`h-8 w-8 transition-colors duration-300 ${
                              activeSection === index ? 'text-white' : 'text-gray-500'
                            }`}
                          />
                        </motion.div>
                        <h3 
                          className={`text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-300 ${
                            activeSection === index ? 'text-purple-600' : 'text-gray-300'
                          }`}
                        >
                          {section.title}
                        </h3>
                      </motion.div>
                    ))}
                  </div>

                  {/* Right Side - Static Box with Text Transitions */}
                  <div className="lg:pl-8">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl border border-purple-100">
                      <div className="flex items-center gap-6 mb-8">
                        <motion.div 
                          className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg"
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <motion.div
                            key={`icon-${activeSection}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {React.createElement(sections[activeSection].icon, {
                              className: "h-10 w-10 text-white"
                            })}
                          </motion.div>
                        </motion.div>
                        <motion.h4 
                          key={`title-${activeSection}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          className="text-2xl font-bold text-gray-900"
                        >
                          {sections[activeSection].title}
                        </motion.h4>
                      </div>
                      
                      <motion.p 
                        key={`desc-${activeSection}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl text-gray-600 leading-relaxed mb-10"
                      >
                        {sections[activeSection].description}
                      </motion.p>

                      {/* Progress indicators */}
                      <div className="flex gap-3 mb-8">
                        {sections.map((_, index) => (
                          <motion.div
                            key={index}
                            className={`h-2 rounded-full flex-1`}
                            animate={{
                              backgroundColor: index === activeSection ? '#9333ea' : '#e5e7eb'
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        ))}
                      </div>

                      {/* CTA Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={scrollToWizard} 
                          size="lg" 
                          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold w-full"
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SmartDealSection = () => {
    const { scrollToWizard } = useForm();
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [hoveredCard, setHoveredCard] = useState<'cheap' | 'smart' | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    const warningPoints = [
        {
            id: 1,
            icon: Shield,
            title: "Coverage gaps",
            description: "Basic policies might exclude GP visits, specialists, or dental care - services you use regularly.",
            detail: "You could pay $200+ per GP visit, $500+ for specialist consultations"
        },
        {
            id: 2,
            icon: Clock,
            title: "Waiting periods",
            description: "Cheap policies often have longer waits before you can claim - sometimes 12+ months for pre-existing conditions.",
            detail: "Emergency treatment may not be covered immediately after signing up"
        },
        {
            id: 3,
            icon: BarChart3,
            title: "Annual limits",
            description: "Low-cost plans may cap your yearly benefits, leaving you exposed for major treatments.",
            detail: "Limits as low as $1,000 annually - one procedure could max out your coverage"
        }
    ];

    return (
        <section ref={sectionRef} className="relative overflow-hidden py-16 sm:py-24">
            {/* Background with gradient and floating elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50"></div>
            
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-16 h-16 border border-purple-200 rounded-full opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            x: [-10, 10, -10],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                    />
                ))}
                
                {/* Medical cross symbols */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={`cross-${i}`}
                        className="absolute w-8 h-8 opacity-5"
                        style={{
                            left: `${20 + i * 20}%`,
                            top: `${30 + i * 15}%`,
                        }}
                        animate={{
                            rotate: [0, 360],
                            opacity: [0.05, 0.1, 0.05]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            delay: i * 2
                        }}
                    >
                        <div className="w-full h-full bg-purple-400 rounded-sm"></div>
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Split Screen Layout - 60/40 */}
                <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto items-center min-h-[600px]">
                    
                    {/* Left Section - Educational Content (60%) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Headline with gradient text */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Why the{' '}
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    cheapest
                                </span>{' '}
                                health insurance isn't always the{' '}
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    best deal
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                The lowest sticker price can cost more later. Watch for:
                            </p>
                        </motion.div>

                        {/* Warning Points as Cards */}
                        <div className="space-y-4">
                            {warningPoints.map((point, index) => (
                                <motion.div
                                    key={point.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                                    transition={{ 
                                        duration: 0.6, 
                                        delay: 0.2 + index * 0.2,
                                        ease: "easeOut" 
                                    }}
                                    className="group relative"
                                    onMouseEnter={() => setHoveredPoint(point.id)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                >
                                    <motion.div
                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 cursor-pointer"
                                        whileHover={{ 
                                            y: -5,
                                            boxShadow: "0 20px 40px rgba(124, 58, 237, 0.15)"
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                                animate={{
                                                    scale: hoveredPoint === point.id ? 1.1 : 1,
                                                    rotate: hoveredPoint === point.id ? 5 : 0
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <point.icon className="h-5 w-5" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-2">
                                                    {point.title}
                                                </h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {point.description}
                                                </p>
                                                
                                                {/* Tooltip on hover */}
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{
                                                        opacity: hoveredPoint === point.id ? 1 : 0,
                                                        height: hoveredPoint === point.id ? 'auto' : 0
                                                    }}
                                                    className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400"
                                                >
                                                    <p className="text-sm text-purple-700 font-medium">
                                                        💡 {point.detail}
                                                    </p>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - Visual Storytelling (40%) */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="space-y-6"
                        >
                            {/* Balance Scale Illustration */}
                            <div className="relative h-48 flex items-center justify-center mb-8">
                                <motion.div
                                    className="absolute"
                                    animate={{ rotate: [-2, 2, -2] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <ArrowUpDown className="h-16 w-16 text-purple-400" />
                                </motion.div>
                                
                                {/* Left scale - coins */}
                                <motion.div
                                    className="absolute -left-12 top-4"
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                                        <DollarSign className="h-6 w-6 text-yellow-800" />
                                    </div>
                                </motion.div>
                                
                                {/* Right scale - medical icons */}
                                <motion.div
                                    className="absolute -right-12 -top-2"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                                >
                                    <div className="space-y-2">
                                        <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center">
                                            <Heart className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center">
                                            <Activity className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Comparison Cards */}
                            <div className="space-y-4">
                                {/* Cheap Option Card */}
                                <motion.div
                                    className="relative perspective-1000"
                                    onMouseEnter={() => setHoveredCard('cheap')}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <motion.div
                                        className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200 cursor-pointer"
                                        whileHover={{ rotateY: 5, scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center">
                                            <p className="text-sm text-red-600 font-medium mb-1">Cheapest option</p>
                                            <p className="text-xs text-gray-500 mb-2">Basic hospital cover only</p>
                                            <motion.p 
                                                className="text-3xl font-bold text-red-700"
                                                animate={{ scale: hoveredCard === 'cheap' ? 1.1 : 1 }}
                                            >
                                                $45<span className="text-sm">/month</span>
                                            </motion.p>
                                        </div>
                                        
                                        {/* Hidden details on hover */}
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: hoveredCard === 'cheap' ? 1 : 0,
                                                height: hoveredCard === 'cheap' ? 'auto' : 0
                                            }}
                                            className="mt-4 space-y-2"
                                        >
                                            <div className="flex items-center gap-2 text-sm">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span className="text-gray-600">No GP visits</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span className="text-gray-600">No dental cover</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>

                                {/* VS Badge */}
                                <div className="text-center">
                                    <motion.div
                                        className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg"
                                        animate={{ 
                                            boxShadow: [
                                                "0 0 20px rgba(124, 58, 237, 0.3)",
                                                "0 0 30px rgba(124, 58, 237, 0.5)",
                                                "0 0 20px rgba(124, 58, 237, 0.3)"
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        VS
                                    </motion.div>
                                </div>

                                {/* Smart Option Card */}
                                <motion.div
                                    className="relative perspective-1000"
                                    onMouseEnter={() => setHoveredCard('smart')}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <motion.div
                                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 cursor-pointer"
                                        whileHover={{ rotateY: -5, scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center">
                                            <p className="text-sm text-green-600 font-medium mb-1">Smarter alternative</p>
                                            <p className="text-xs text-gray-500 mb-2">Comprehensive with GP visits</p>
                                            <motion.p 
                                                className="text-3xl font-bold text-green-700"
                                                animate={{ scale: hoveredCard === 'smart' ? 1.1 : 1 }}
                                            >
                                                $65<span className="text-sm">/month</span>
                                            </motion.p>
                                        </div>
                                        
                                        {/* Hidden details on hover */}
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: hoveredCard === 'smart' ? 1 : 0,
                                                height: hoveredCard === 'smart' ? 'auto' : 0
                                            }}
                                            className="mt-4 space-y-2"
                                        >
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-600">GP visits included</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-600">Dental & optical</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-600">Specialist care</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Bottom explanation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 1 }}
                                className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-100"
                            >
                                <p className="text-sm text-gray-600 font-medium">
                                    💡 For $20 more monthly, save hundreds per year on routine healthcare
                                </p>
                            </motion.div>

                            {/* CTA Button with enhanced effects */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.6, delay: 1.2 }}
                                className="text-center"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button 
                                        onClick={scrollToWizard}
                                        size="lg"
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
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
                    </div>
                </div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                    className="text-center mt-12"
                >
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>No hidden fees</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Instant quotes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>24/7 Support</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 max-w-2xl mx-auto">
                        *Figures are illustrative; your premium depends on age, health status, location, and chosen coverage level.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

const MythBustingSection = () => {
    const myths = [
        {
            myth: "Health insurance is too expensive.",
            truth: "Basic cover starts from around $20-30/week. Many Kiwis spend more on coffee. We find options that fit your budget.",
            icon: XCircle
        },
        {
            myth: "I'm young and healthy, I don't need it.",
            truth: "Accidents happen at any age. Plus, joining while healthy means no medical underwriting and lower premiums for life.",
            icon: XCircle
        },
        {
            myth: "Public healthcare covers everything I need.",
            truth: "Public system has long wait times. Private health insurance gives you choice of timing, specialists, and private hospitals.",
            icon: XCircle
        }
    ];

    return (
        <section className="bg-white py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-primary text-center mb-12">Busting Common Health Insurance Myths</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {myths.map((item, index) => (
                        <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <item.icon className="h-6 w-6 text-destructive" />
                                    <CardTitle className="text-lg">{item.myth}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">{item.truth}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

const HowItWorksSection = () => {
    const { scrollToWizard } = useForm();
    const steps = [
        {
            icon: FileText,
            title: "1. Tell us about your health needs (2 minutes).",
            description: "Age, family size, current health status, coverage preferences - GP visits, specialists, or comprehensive care."
        },
        {
            icon: Users,
            title: "2. We compare the market for you.",
            description: "Our team reviews your details against 15+ health insurers and builds a shortlist tailored to your health needs and budget."
        },
        {
            icon: ThumbsUp,
            title: "3. Your dedicated adviser gets in touch.",
            description: "We'll contact you with your curated health insurance options, explain waiting periods, and answer questions in plain English."
        },
        {
            icon: Check,
            title: "4. You choose and apply with confidence.",
            description: "We streamline the paperwork and keep you updated through underwriting and policy setup."
        }
    ];

    return (
        <section className="bg-gray-50 py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-primary text-center mb-12">How our NZ health insurance comparison works</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-12 max-w-7xl mx-auto">
                    {steps.map(step => (
                         <div key={step.title} className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full mt-1">
                                <step.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Button onClick={scrollToWizard} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">Compare now</Button>
                </div>
            </div>
        </section>
    );
};

const StoriesSection = () => {
    const { scrollToWizard } = useForm();
    const stories = [
        { name: "Sarah (32, teacher)", story: "Needed surgery for a sports injury. Private health insurance meant I got treatment within 2 weeks instead of waiting 6 months publicly." },
        { name: "Mike & Emma (young family)", story: "Basic family cover gives us peace of mind. When our daughter needed emergency treatment, we had choice of specialist and timing." },
        { name: "David (55, self-employed)", story: "Comprehensive cover includes dental and optical. Saves me $2000+ annually on regular health expenses." },
    ];
    return (
        <section className="bg-white py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-primary text-center mb-12">How we helped real people get the best health cover</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {stories.map(s => (
                        <div key={s.name} className="bg-gray-50 p-6 rounded-lg shadow-md border">
                            <p className="text-gray-600 mb-4">&quot;{s.story}&quot;</p>
                            <p className="font-bold text-right">- {s.name}</p>
                        </div>
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Button onClick={scrollToWizard} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">Compare now</Button>
                </div>
            </div>
        </section>
    );
};

const WhatYouGetSection = () => {
    const { scrollToWizard } = useForm();
    const benefits = [
        "A curated shortlist of health insurance options from top NZ insurers",
        "Clear explanations of coverage levels, waiting periods, and exclusions", 
        "Best-value highlights (not just 'cheapest') based on your health priorities",
        "Expert guidance from a licensed health insurance adviser — at no extra cost",
        "No obligation. Your pace, your call."
    ];
    return (
        <section className="bg-gray-50 py-16 sm:py-24">
             <div className="container mx-auto px-4">
                 <h2 className="text-3xl font-bold text-primary text-center mb-8">What you get</h2>
                 <div className="max-w-7xl mx-auto">
                    <ul className="space-y-4 max-w-2xl mx-auto">
                        {benefits.map(b => (
                            <li key={b} className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
                <div className="text-center mt-12">
                    <Button onClick={scrollToWizard} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">Compare now</Button>
                </div>
            </div>
        </section>
    );
};

const FinalCTASection = () => {
    const { scrollToWizard } = useForm();
    return (
        <section className="bg-primary text-white py-16 sm:py-24">
            <div className="container mx-auto px-4 text-center max-w-7xl">
                <h2 className="text-3xl font-bold mb-2">Ready to find the right health insurance?</h2>
                <p className="text-lg text-primary-foreground/80 mb-8">Start now. You'll be done before the kettle boils.</p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <Button onClick={scrollToWizard} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">Compare now</Button>
                    <Button onClick={scrollToWizard} size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-purple-600">Compare now</Button>
                </div>
            </div>
        </section>
    );
};

const FaqSection = () => {
    const faqs = [
        { q: "What happens after I submit my details?", a: "We'll review your information, compare plans from top NZ health insurers, and a dedicated adviser will contact you with tailored options. No instant quotes - we provide personalized recommendations." },
        { q: "Is the cheapest health insurance always best?", a: "Not necessarily. The cheapest often has the most exclusions and longest waiting periods. We help you find the best value - the right coverage for your budget." },
        { q: "What's the difference between basic and comprehensive cover?", a: "Basic covers hospital treatment. Comprehensive adds GP visits, specialists, dental, optical, and sometimes alternative therapies. We'll explain what each level includes." },
        { q: "How long are waiting periods?", a: "Varies by condition and insurer. Accidents are usually covered immediately, pre-existing conditions may have 12+ month waits. We'll show you the differences." },
        { q: "Can I get cover if I have health conditions?", a: "Often yes, but conditions may be excluded or have longer waiting periods. Some insurers are more flexible than others - we'll find your best options." },
        { q: "Do I need a medical exam?", a: "Depends on your age, health, and level of cover. Many applications are based on health questionnaires. We'll explain requirements upfront." },
        { q: "Can I cancel anytime?", a: "Most policies can be cancelled with 30 days notice. However, if you cancel and re-join later, you may face new waiting periods and health assessments." },
    ];

    return (
        <section className="bg-gray-50 py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-primary text-center mb-8">Health insurance FAQs (NZ)</h2>
                 <Accordion type="single" collapsible className="w-full max-w-7xl mx-auto">
                    {faqs.map(faq => (
                        <AccordionItem value={faq.q} key={faq.q}>
                            <AccordionTrigger>{faq.q}</AccordionTrigger>
                            <AccordionContent>
                                <p dangerouslySetInnerHTML={{ __html: faq.a }}></p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            </div>
        </section>
    );
};

const ComplianceSection = () => {
    return (
        <section className="bg-gray-100 py-8">
            <div className="container mx-auto px-4 text-center text-xs text-gray-500 max-w-7xl">
                <h3 className="font-bold mb-2">Compliance</h3>
                <p>This page provides <strong>general information only</strong> and does not take into account your objectives, financial situation, or needs. Consider seeking <strong>advice from a licensed financial adviser</strong> and reading the relevant policy documents before making decisions. Quotes are <strong>indicative</strong> and subject to underwriting and eligibility.</p>
            </div>
        </section>
    );
}

export default function HealthPage() {
  const { setQuoteWizardRef } = useForm();
  const quoteWizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuoteWizardRef(quoteWizardRef);
  }, [setQuoteWizardRef]);

  return (
      <main className="w-full text-foreground bg-white">
        <div ref={quoteWizardRef}>
            <HealthPageHero />
        </div>
        <Insurers />
        <WhyCompareSection />
        <SmartDealSection />
        <MythBustingSection />
        <HowItWorksSection />
        <StoriesSection />
        <WhatYouGetSection />
        <FinalCTASection />
        <FaqSection />
        <ComplianceSection />
      </main>
  );
}