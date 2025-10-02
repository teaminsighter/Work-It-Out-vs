
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, DollarSign, User, Phone, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FormData {
  occupation?: string;
  currentIncome?: string;
  coveragePercentage?: string;
  age?: string;
  healthStatus?: string;
  name?: string;
  email?: string;
  phone?: string;
}

const steps = [
  {
    id: 'occupation',
    title: 'What is your occupation?',
    type: 'select',
    options: [
      { value: 'professional', label: 'Professional (office worker, manager)' },
      { value: 'tradesperson', label: 'Tradesperson (electrician, plumber)' },
      { value: 'healthcare', label: 'Healthcare worker' },
      { value: 'teacher', label: 'Teacher/Educator' },
      { value: 'other', label: 'Other' },
    ]
  },
  {
    id: 'current-income',
    title: 'What is your annual income?',
    type: 'select',
    options: [
      { value: 'under-50k', label: 'Under $50,000' },
      { value: '50k-75k', label: '$50,000 - $75,000' },
      { value: '75k-100k', label: '$75,000 - $100,000' },
      { value: '100k-150k', label: '$100,000 - $150,000' },
      { value: 'over-150k', label: 'Over $150,000' },
    ]
  },
  {
    id: 'coverage-percentage',
    title: 'What percentage of your income would you like covered?',
    type: 'select',
    options: [
      { value: '60', label: '60% of income' },
      { value: '70', label: '70% of income' },
      { value: '80', label: '80% of income' },
      { value: '85', label: '85% of income (maximum)' },
    ]
  },
  {
    id: 'age',
    title: 'How old are you?',
    type: 'input',
    inputType: 'number',
    placeholder: 'Enter your age'
  },
  {
    id: 'health-status',
    title: 'How would you describe your current health?',
    type: 'select',
    options: [
      { value: 'excellent', label: 'Excellent - no health issues' },
      { value: 'good', label: 'Good - minor issues' },
      { value: 'fair', label: 'Fair - some ongoing conditions' },
      { value: 'poor', label: 'Poor - significant health issues' },
    ]
  },
  {
    id: 'contact',
    title: 'Get Your Income Protection Quote',
    type: 'contact',
  }
];

export default function QuoteWizardIncome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle form submission
      console.log('Income protection quote submitted:', formData);
      alert('Income protection quote request submitted! We will contact you soon with your personalized income protection options.');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    const step = steps[currentStep];
    const value = formData[step.id as keyof FormData];
    
    if (step.type === 'contact') {
      return formData.name && formData.email && formData.phone;
    }
    
    return value && value.trim() !== '';
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    if (step.type === 'select' && step.options) {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{step.title}</h2>
          <div className="grid gap-3">
            {step.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(step.id, option.value)}
                className={`p-4 text-left border rounded-lg transition-all hover:border-green-500 ${
                  formData[step.id as keyof FormData] === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step.type === 'input') {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{step.title}</h2>
          <input
            type={step.inputType || 'text'}
            placeholder={step.placeholder}
            value={formData[step.id as keyof FormData] || ''}
            onChange={(e) => handleInputChange(step.id, e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
          />
        </div>
      );
    }

    if (step.type === 'contact') {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{step.title}</h2>
          <p className="text-gray-600 mb-6">We'll send you personalized income protection options to secure your financial future.</p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <Phone className="h-5 w-5 text-green-600" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative rounded-xl border bg-white text-gray-900 p-6 shadow-2xl sm:p-10 mt-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, type: "tween" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep > 0 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <span>{currentStep === steps.length - 1 ? 'Get My Quote' : 'Next'}</span>
            {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
