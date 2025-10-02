'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, RotateCcw, Bot, User, Navigation, BarChart3, FileText } from 'lucide-react';
import { useAdminContext } from '@/contexts/AdminContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: string;
  data?: any;
}

interface AIAssistantProps {
  onNavigate?: (category: string, tab?: string) => void;
}

const AIAssistant = ({ onNavigate }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getContextForAI } = useAdminContext();

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  // Send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    console.log('🤖 Sending message to AI:', userMessage.content);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          context: getContextForAI()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 AI Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'AI service returned an error');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message || 'I received your message but had trouble generating a response.',
        timestamp: new Date().toISOString(),
        action: result.action,
        data: result.data
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log('✅ Message added to chat');

      // Handle navigation actions
      if (result.action === 'navigation' && result.data && onNavigate) {
        console.log('🧭 Navigating to:', result.data);
        onNavigate(result.data.category, result.data.tab);
      }

    } catch (error) {
      console.error('❌ AI Chat Error:', error);
      
      let errorContent = 'I apologize, but I encountered an error. ';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorContent += 'The request timed out. Please try again.';
        } else if (error.message.includes('fetch')) {
          errorContent += 'Unable to connect to the AI service. Please check your connection.';
        } else {
          errorContent += `Error: ${error.message}`;
        }
      } else {
        errorContent += 'An unknown error occurred. Please try again.';
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Request completed');
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear conversation
  const clearConversation = async () => {
    try {
      await fetch('/api/ai/chat', { method: 'DELETE' });
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  };

  // Render message with formatting
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
          <div
            className={`p-3 rounded-lg ${
              isUser
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            {/* Action indicators */}
            {message.action && !isUser && (
              <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                {message.action === 'navigation' && <Navigation className="w-3 h-3" />}
                {message.action === 'query' && <BarChart3 className="w-3 h-3" />}
                {message.action === 'action' && <FileText className="w-3 h-3" />}
                <span className="capitalize">{message.action}</span>
              </div>
            )}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )}
      </motion.div>
    );
  };

  // Floating button to open assistant
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ 
          scale: 1.1, 
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.5 }
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-purple-500/25 transition-all duration-300 group"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
        }}
      >
        {/* Animated AI Brain Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* Main Brain/AI Icon */}
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14.5C15.88 7 17 8.12 17 9.5C17 10.88 15.88 12 14.5 12H13V13.27C13.6 13.61 14 14.26 14 15C14 16.1 13.1 17 12 17C10.9 17 10 16.1 10 15C10 14.26 10.4 13.61 11 13.27V12H9.5C8.12 12 7 10.88 7 9.5C7 8.12 8.12 7 9.5 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z"
              fill="currentColor"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
            {/* Thinking dots */}
            <motion.circle cx="8" cy="9" r="1" fill="currentColor" 
              animate={{ opacity: [0.3, 1, 0.3] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} 
            />
            <motion.circle cx="12" cy="9" r="1" fill="currentColor" 
              animate={{ opacity: [0.3, 1, 0.3] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} 
            />
            <motion.circle cx="16" cy="9" r="1" fill="currentColor" 
              animate={{ opacity: [0.3, 1, 0.3] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} 
            />
          </svg>
          
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {/* Notification badge */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-green-400 rounded-full animate-ping" />
        </motion.div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        height: isMinimized ? 'auto' : '600px'
      }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col border"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          {/* Animated header icon */}
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 6.26L17 4L14.74 8.91L19 10L14.74 11.09L17 16L13.09 13.74L12 18L10.91 13.74L7 16L9.26 11.09L5 10L9.26 8.91L7 4L10.91 6.26L12 2Z" fill="currentColor"/>
              <motion.circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1"
                animate={{ r: [2, 4, 2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </svg>
          </motion.div>
          <div>
            <h3 className="font-bold text-lg">AI Assistant</h3>
            <p className="text-xs text-white/80">Powered by Advanced Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={clearConversation}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">
                    Hi! I'm your AI assistant. Ask me about:
                  </p>
                  <ul className="text-xs mt-2 space-y-1 text-left max-w-xs mx-auto">
                    <li>• "Show me high priority leads"</li>
                    <li>• "Navigate to analytics dashboard"</li>
                    <li>• "What are my conversion rates?"</li>
                    <li>• "Search for leads from Google Ads"</li>
                  </ul>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-blue-600">Quick Tests:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setInputMessage('Hello, test connection');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Test Connection
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('Show me all leads');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Get Leads
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('Navigate to analytics');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                      >
                        Test Navigation
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('What are my conversion rates?');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                      >
                        Get Analytics
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => {
                          setInputMessage('How many tabs are in the admin panel?');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition-colors"
                      >
                        Count Tabs
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('Analyze this current tab');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-colors"
                      >
                        Analyze Tab
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('How do I use this section?');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-teal-500 text-white text-xs rounded hover:bg-teal-600 transition-colors"
                      >
                        Get Help
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('What features are available here?');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="px-2 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 transition-colors"
                      >
                        List Features
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.map(renderMessage)}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <div className="text-xs text-gray-500">Processing your request...</div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your leads..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Press Enter to send • Type naturally and I'll help you navigate and analyze your data
                </p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <span className="text-xs text-gray-500">
                    {isLoading ? 'Processing...' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAssistant;