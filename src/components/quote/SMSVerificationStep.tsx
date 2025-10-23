'use client';

import { useState, useEffect } from 'react';
import { useForm } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Phone, RotateCcw, CheckCircle } from 'lucide-react';
import type { Question } from '@/types';

interface SMSVerificationStepProps {
  question: Question;
}

export default function SMSVerificationStep({ question }: SMSVerificationStepProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentCode, setSentCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  
  const { handleAnswer, formData } = useForm();

  // Send SMS when component mounts
  useEffect(() => {
    if (formData.phone && !smsSent) {
      sendSMS();
    }
  }, [formData.phone]);

  // Countdown timer
  useEffect(() => {
    if (smsSent && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsSent, timeLeft]);

  const sendSMS = async () => {
    setIsSending(true);
    setError('');
    
    try {
      const response = await fetch('/api/send-sms-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phone })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSmsSent(true);
        setTimeLeft(600); // Reset timer
        setSentCode(result.verificationCode);
        
        // Show demo mode message if applicable
        if (result.demoMode) {
          console.log('Demo mode active:', result.message);
        }
      } else {
        setError(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerification = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const response = await fetch('/api/verify-sms-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: formData.phone, 
          code,
          sentCode // For demo purposes - remove in production
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        handleAnswer('sms-verification', { verified: true, code });
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{question.question}</h2>
        <p className="text-gray-600">{question.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          Sent to: {formData.phone}
        </p>
      </div>

      {/* Demo info - remove in production */}
      {sentCode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>🧪 Test Mode:</strong> Your verification code is: <strong>{sentCode}</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {formData.phone?.startsWith('+88') ? 
              'Bangladesh numbers use demo mode - code shown above' : 
              'Development mode - code displayed for testing'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
              if (error) setError('');
            }}
            className="text-center text-xl tracking-widest"
            maxLength={6}
            disabled={isVerifying}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {smsSent && timeLeft > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Code expires in: {formatTime(timeLeft)}
          </div>
        )}

        <Button 
          onClick={handleVerification}
          disabled={code.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={sendSMS}
            disabled={isSending || timeLeft > 540} // Can resend after 1 minute
            className="text-sm"
          >
            {isSending ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : timeLeft > 540 ? (
              `Resend in ${formatTime(600 - timeLeft)}`
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}