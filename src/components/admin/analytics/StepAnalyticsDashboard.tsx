'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Smartphone, 
  Monitor, 
  Tablet,
  ArrowDown,
  ArrowUp,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Settings,
  CheckCircle,
  FileText,
  Heart,
  Shield,
  DollarSign
} from 'lucide-react';

// Form type definitions
type FormType = 'main' | 'life' | 'health' | 'income';

interface FormStep {
  stepNumber: number;
  stepName: string;
  totalEntries: number;
  completions: number;
  dropOffs: number;
  conversionRate: number;
  averageDuration: number;
  popularChoices: Record<string, number>;
}

interface FormQuestion {
  questionId: string;
  questionText: string;
  answerCount: number;
  skipCount: number;
  averageTime: number;
  popularAnswers: Array<{
    answer: string;
    count: number;
    percentage: number;
  }>;
}

interface FormAnalyticsData {
  overview: {
    totalViews: number;
    totalStarts: number;
    totalCompletions: number;
    conversionRate: number;
    averageCompletionTime: number;
    dropOffRate: number;
  };
  steps: FormStep[];
  questions: FormQuestion[];
  deviceBreakdown: Record<string, number>;
  geographicData: Record<string, number>;
}

const StepAnalyticsDashboard = () => {
  const [selectedFormType, setSelectedFormType] = useState<FormType>('main');
  const [formData, setFormData] = useState<FormAnalyticsData>({
    overview: {
      totalViews: 0,
      totalStarts: 0,
      totalCompletions: 0,
      conversionRate: 0,
      averageCompletionTime: 0,
      dropOffRate: 0
    },
    steps: [],
    questions: [],
    deviceBreakdown: {},
    geographicData: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Form type configurations
  const formTypes = [
    { id: 'main' as FormType, name: 'Main Form', icon: FileText, color: 'blue' },
    { id: 'life' as FormType, name: 'Life Insurance', icon: Heart, color: 'red' },
    { id: 'health' as FormType, name: 'Health Insurance', icon: Shield, color: 'green' },
    { id: 'income' as FormType, name: 'Income Protection', icon: DollarSign, color: 'purple' }
  ];

  useEffect(() => {
    loadFormAnalytics();
  }, [selectedFormType, selectedTimeframe]);

  const loadFormAnalytics = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/analytics/form-analytics?formType=${selectedFormType}&range=${selectedTimeframe}`);
      const result = await response.json();
      
      if (result.success) {
        setFormData(result.data);
      }
    } catch (error) {
      console.error('Error loading form analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      try {
        await fetch('/api/analytics/clear-data', { method: 'POST' });
        loadAnalyticsData();
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };


  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Step Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">User behavior analysis through insurance quote process steps</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearData}
            className="text-red-600 px-4 py-2 rounded-lg font-medium transition-colors border border-red-300 hover:bg-red-50"
          >
            Clear Data
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadAnalyticsData}
            className="text-gray-600 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 hover:bg-gray-50"
          >
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.totalSessions || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#146443' }}>
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.conversionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+2.1%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Steps Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.averageStepsCompleted?.toFixed(1) || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">-0.3</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lead Conversions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.conversions || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.2%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>
      </div>

      {/* Step Funnel Analysis - Compact Professional Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Conversion Funnel</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-1" />
              Step-by-step user journey
            </div>
            <div className="text-sm text-gray-500">
              Total Sessions: <span className="font-semibold text-gray-900">{funnelData[0]?.totalEntries || 0}</span>
            </div>
          </div>
        </div>

        {/* Compact Horizontal Funnel */}
        <div className="relative">
          {/* Funnel Steps Container */}
          <div className="flex items-center justify-between mb-8">
            {funnelData.map((step, index) => {
              
              return (
                <motion.div
                  key={step.stepNumber}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex-1 relative group"
                >
                  {/* Funnel Step */}
                  <div 
                    className="relative mx-1 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    style={{
                      height: '120px',
                      backgroundColor: step.conversionRate >= 70 ? '#146443' : 
                                     step.conversionRate >= 50 ? '#f59e0b' : '#ef4444',
                      clipPath: index === funnelData.length - 1 
                        ? 'none' 
                        : `polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)`
                    }}
                  >
                    {/* Step Content */}
                    <div className="p-3 h-full flex flex-col justify-between text-white">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-sm font-bold">{step.stepNumber}</span>
                        </div>
                        <h4 className="text-xs font-medium truncate">{step.stepName}</h4>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold">{step.totalEntries}</div>
                        <div className="text-xs opacity-90">{step.conversionRate.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Hover Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap">
                        <div>Entries: {step.totalEntries}</div>
                        <div>Completions: {step.completions}</div>
                        <div>Drop-offs: {step.dropOffs}</div>
                        <div>Avg. Time: {formatDuration(step.averageDuration)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Arrow */}
                  {index < funnelData.length - 1 && (
                    <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                        <ArrowDown className="w-2 h-2 text-gray-500 transform rotate-90" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Detailed Performance Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Step</th>
                    <th className="text-center py-2 font-medium text-gray-700">Entries</th>
                    <th className="text-center py-2 font-medium text-gray-700">Rate</th>
                    <th className="text-center py-2 font-medium text-gray-700">Drop-offs</th>
                    <th className="text-center py-2 font-medium text-gray-700">Avg. Time</th>
                    <th className="text-left py-2 font-medium text-gray-700">Top Choice</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelData.map((step) => {
                    const topChoice = step.popularChoices && Object.entries(step.popularChoices)
                      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
                    
                    return (
                      <tr key={step.stepNumber} className="border-b border-gray-100 hover:bg-white transition-colors">
                        <td className="py-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-xs font-bold text-white"
                                 style={{ backgroundColor: '#146443' }}>
                              {step.stepNumber}
                            </div>
                            <span className="font-medium text-gray-900 truncate">{step.stepName}</span>
                          </div>
                        </td>
                        <td className="text-center py-2 font-medium">{step.totalEntries}</td>
                        <td className="text-center py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConversionColor(step.conversionRate)}`}>
                            {step.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-2 text-red-600 font-medium">{step.dropOffs}</td>
                        <td className="text-center py-2 text-gray-600">{formatDuration(step.averageDuration)}</td>
                        <td className="py-2">
                          {topChoice && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {topChoice[0]}: {topChoice[1]}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Question Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Question Analysis</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Response Quality: <span className="font-semibold text-green-600">92.3%</span>
            </div>
            <div className="text-sm text-gray-500">
              Avg. Response Time: <span className="font-semibold text-gray-900">1.8s</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 1. Circular Response Rate Visualization */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Response Rates</h3>
            <div className="space-y-3">
              {[
                { question: 'Insurance Type', rate: 94.5, color: '#146443' },
                { question: 'Coverage Amount', rate: 87.2, color: '#16a34a' },
                { question: 'Personal Details', rate: 82.8, color: '#22c55e' },
                { question: 'Health Questions', rate: 76.3, color: '#4ade80' },
                { question: 'Contact Pref', rate: 68.9, color: '#86efac' }
              ].map((item) => (
                <div key={item.question} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full border-4 border-gray-200 relative mr-3">
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-transparent"
                        style={{
                          borderTopColor: item.color,
                          transform: `rotate(${(item.rate / 100) * 360}deg)`,
                          borderRightColor: item.rate > 25 ? item.color : 'transparent',
                          borderBottomColor: item.rate > 50 ? item.color : 'transparent',
                          borderLeftColor: item.rate > 75 ? item.color : 'transparent'
                        }}
                      />
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold" style={{ color: item.color }}>
                          {Math.round(item.rate)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.question}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.rate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Heatmap-style Question Performance */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Difficulty</h3>
            <div className="grid grid-cols-5 gap-1">
              {[
                0.2, 0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.3, 0.2, 0.5,
                0.4, 0.7, 0.6, 0.3, 0.8, 0.2, 0.5, 0.7, 0.4, 0.6,
                0.3, 0.8, 0.2, 0.5, 0.7
              ].map((difficulty, i) => {
                const color = difficulty > 0.7 ? '#ef4444' : difficulty > 0.4 ? '#f59e0b' : '#146443';
                const opacity = 0.3 + (difficulty * 0.7);
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-sm cursor-pointer hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: color, opacity }}
                    title={`Question ${i + 1}: ${Math.round(difficulty * 100)}% difficulty`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Hard</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#146443' }}></div>
                <span>High Response</span>
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Medium</span>
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Low Response</span>
              </div>
            </div>
          </div>

          {/* 3. Answer Pattern Flow */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Answer Patterns</h3>
            <div className="space-y-2">
              {[
                { pattern: 'Life Insurance → Quick Quote', count: 234, percentage: 23.4 },
                { pattern: 'Health Insurance → Compare Plans', count: 187, percentage: 18.7 },
                { pattern: 'Income Protection → Need Advice', count: 156, percentage: 15.6 },
                { pattern: 'Mortgage Protection → Urgent', count: 134, percentage: 13.4 },
                { pattern: 'Multiple Types → Research Phase', count: 98, percentage: 9.8 }
              ].map((pattern, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-900 truncate flex-1 mr-2">
                      {pattern.pattern}
                    </span>
                    <span className="text-gray-600">{pattern.count}</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{ width: `${pattern.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Timeline-based Question Sequence Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Flow Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Flow Optimization</h3>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-8 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 to-green-400"></div>
              
              <div className="space-y-4">
                {[
                  { question: 'Landing Page Visit', time: '0s', drop: 5, status: 'excellent' },
                  { question: 'Insurance Type Selection', time: '12s', drop: 8, status: 'good' },
                  { question: 'Coverage Requirements', time: '28s', drop: 15, status: 'warning' },
                  { question: 'Personal Details', time: '45s', drop: 12, status: 'good' },
                  { question: 'Contact Information', time: '67s', drop: 22, status: 'poor' }
                ].map((step, index) => (
                  <div key={index} className="relative flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 ${
                      step.status === 'excellent' ? 'bg-green-500' :
                      step.status === 'good' ? 'bg-blue-500' :
                      step.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{step.question}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">{step.time}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            step.drop < 10 ? 'bg-green-100 text-green-700' :
                            step.drop < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {step.drop}% drop
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Question Insights */}
          <div className="space-y-4">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                <div className="text-lg font-bold">2.4s</div>
                <div className="text-xs opacity-90">Avg. Response Time</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                <div className="text-lg font-bold">87.3%</div>
                <div className="text-xs opacity-90">Completion Rate</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
                <div className="text-lg font-bold">3.2</div>
                <div className="text-xs opacity-90">Avg. Revisions</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
                <div className="text-lg font-bold">92%</div>
                <div className="text-xs opacity-90">Answer Quality</div>
              </div>
            </div>

            {/* AI Optimization Suggestions */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">AI Optimization Suggestions</h4>
              <div className="space-y-2">
                {[
                  { icon: '🎯', text: 'Move "Insurance Type" question earlier for better engagement', priority: 'high' },
                  { icon: '⚡', text: 'Simplify address input with autocomplete', priority: 'medium' },
                  { icon: '🔄', text: 'Add progress indicator to reduce abandonment', priority: 'high' },
                  { icon: '📱', text: 'Optimize contact form for mobile users', priority: 'medium' }
                ].map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-sm">{suggestion.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-800">{suggestion.text}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {suggestion.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Question Analysis with Answer Breakdown */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Question Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Question 1: Home Size Selection */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">🛡️ Insurance type selection</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">92.3% response</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">1.8s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: 'Life Insurance', percentage: 32.4, count: 298 },
                  { answer: 'Health Insurance', percentage: 28.1, count: 259 },
                  { answer: 'Income Protection', percentage: 19.7, count: 182 },
                  { answer: 'Mortgage Protection', percentage: 14.2, count: 131 },
                  { answer: 'Multiple Types', percentage: 5.6, count: 52 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-20">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 2: Usage Pattern */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">💰 Coverage amount needed</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">89.7% response</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">2.3s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: '$100,000 - $250,000', percentage: 42.8, count: 384 },
                  { answer: '$250,000 - $500,000', percentage: 26.5, count: 238 },
                  { answer: '$500,000 - $1,000,000', percentage: 18.2, count: 163 },
                  { answer: '$1,000,000+', percentage: 12.5, count: 112 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-32">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 3: Property Type */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">👤 Age group</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">85.3% response</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">2.8s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: '25-35 years', percentage: 35.2, count: 301 },
                  { answer: '36-45 years', percentage: 28.4, count: 243 },
                  { answer: '46-55 years', percentage: 21.7, count: 186 },
                  { answer: '56-65 years', percentage: 9.1, count: 78 },
                  { answer: '18-24 years', percentage: 5.6, count: 48 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-28">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 4: Daily Energy Usage */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">💼 Insurance type selection</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">78.9% response</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">2.1s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: '15-25 kWh/day', percentage: 32.6, count: 257 },
                  { answer: '25-35 kWh/day', percentage: 28.4, count: 224 },
                  { answer: 'Less than 15 kWh/day', percentage: 19.8, count: 156 },
                  { answer: '35-50 kWh/day', percentage: 13.7, count: 108 },
                  { answer: 'More than 50 kWh/day', percentage: 5.5, count: 43 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-32">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 5: Peak Usage Time */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">📅 When do you need coverage to start?</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">73.4% response</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">2.7s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: 'Immediately', percentage: 38.9, count: 285 },
                  { answer: 'Within 1 month', percentage: 26.3, count: 193 },
                  { answer: 'Within 3 months', percentage: 18.7, count: 137 },
                  { answer: 'Within 6 months', percentage: 11.2, count: 82 },
                  { answer: 'Just comparing', percentage: 4.9, count: 36 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-28">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Upload Analysis */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">📝 Health questionnaire completion</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">43.2% complete</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">95.3s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-600">432</div>
                    <div className="text-gray-600">Completed</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-red-600">89</div>
                    <div className="text-gray-600">Incomplete</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-blue-600">567</div>
                    <div className="text-gray-600">Skipped</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-purple-600">95.3s</div>
                    <div className="text-gray-600">Avg. Time</div>
                  </div>
                </div>
                
                {/* Upload Time Breakdown */}
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">Completion Time Distribution:</div>
                  {[
                    { timeRange: 'Under 60s', percentage: 28.5, count: 123 },
                    { timeRange: '60-120s', percentage: 35.2, count: 152 },
                    { timeRange: '2-5 min', percentage: 22.1, count: 95 },
                    { timeRange: 'Over 5 min', percentage: 14.2, count: 62 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between mb-1">
                      <div className="flex items-center flex-1">
                        <span className="text-xs font-medium text-gray-700 w-16">{item.timeRange}</span>
                        <div className="flex-1 mx-2 bg-white rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-right">
                        <span className="font-semibold">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question 6: Primary Roof Direction */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">📝 Employment status</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">71.8% response</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">3.1s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: 'Full-time employed', percentage: 32.1, count: 231 },
                  { answer: 'Part-time employed', percentage: 19.4, count: 140 },
                  { answer: 'Self-employed', percentage: 16.8, count: 121 },
                  { answer: 'Student', percentage: 12.3, count: 89 },
                  { answer: 'Retired', percentage: 10.2, count: 73 },
                  { answer: 'Unemployed', percentage: 5.8, count: 42 },
                  { answer: 'Homemaker', percentage: 2.1, count: 15 },
                  { answer: 'Other', percentage: 1.3, count: 9 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-20">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 7: Contact Preference */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">📞 Preferred Contact Method</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">94.2% response</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">1.9s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: 'Email', percentage: 48.3, count: 455 },
                  { answer: 'Phone Call', percentage: 32.7, count: 308 },
                  { answer: 'Both Email and Phone', percentage: 19.0, count: 179 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-28">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 8: Installation Timeframe */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">📅 Decision timeline</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">91.6% response</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">2.5s avg</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { answer: 'Need quote urgently', percentage: 35.8, count: 327 },
                  { answer: 'Within 1 month', percentage: 24.1, count: 220 },
                  { answer: 'Within 3 months', percentage: 18.9, count: 173 },
                  { answer: 'Just comparing options', percentage: 12.7, count: 116 },
                  { answer: 'Planning for future', percentage: 8.5, count: 78 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-xs font-medium text-gray-700 w-28">{item.answer}</span>
                      <div className="flex-1 mx-3 bg-white rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-gray-500">({item.count})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(sessionStats.deviceBreakdown || {}).map(([device, count]) => {
              const total = Object.values(sessionStats.deviceBreakdown || {}).reduce((a: any, b: any) => a + b, 0);
              const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
              
              const getDeviceIcon = () => {
                switch (device) {
                  case 'mobile': return <Smartphone className="w-5 h-5" />;
                  case 'tablet': return <Tablet className="w-5 h-5" />;
                  case 'desktop': return <Monitor className="w-5 h-5" />;
                  default: return <Monitor className="w-5 h-5" />;
                }
              };

              return (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      {getDeviceIcon()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{device}</p>
                      <p className="text-sm text-gray-500">{count} sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{percentage.toFixed(1)}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: '#146443'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearData}
              className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Clear Analytics Data</p>
                  <p className="text-sm text-red-600">Reset all tracking data</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadAnalyticsData}
              className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Refresh Analytics</p>
                  <p className="text-sm text-blue-600">Update data display</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Address Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Address Search Analytics</h3>
        
        {/* Address Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{addressAnalytics.totalSearches}</p>
            <p className="text-sm text-blue-600">Total Searches</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{addressAnalytics.uniqueAddresses}</p>
            <p className="text-sm text-green-600">Unique Addresses</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {addressAnalytics.totalSearches > 0 ? (addressAnalytics.uniqueAddresses / addressAnalytics.totalSearches * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-purple-600">Unique Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Search Queries */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Popular Search Queries</h4>
            <div className="space-y-3">
              {Object.entries(addressAnalytics.popularQueries || {})
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([query, count]) => (
                  <div key={query} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">{query}</span>
                    <span className="text-sm text-gray-600 ml-2">{count} searches</span>
                  </div>
                ))}
              {Object.keys(addressAnalytics.popularQueries || {}).length === 0 && (
                <p className="text-gray-500 text-sm italic">No search data available</p>
              )}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Geographic Distribution</h4>
            <div className="space-y-3">
              {Object.entries(addressAnalytics.geographicDistribution || {})
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([region, count]) => {
                  const total = Object.values(addressAnalytics.geographicDistribution || {}).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                  
                  return (
                    <div key={region} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{region}</span>
                          <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#146443'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              {Object.keys(addressAnalytics.geographicDistribution || {}).length === 0 && (
                <p className="text-gray-500 text-sm italic">No geographic data available</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StepAnalyticsDashboard;