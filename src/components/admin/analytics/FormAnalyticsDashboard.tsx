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
  CheckCircle,
  FileText,
  Heart,
  Shield,
  DollarSign,
  Clock,
  Eye
} from 'lucide-react';
import { capitalizeWords, capitalizeStatus } from '@/utils/textUtils';

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

const FormAnalyticsDashboard = () => {
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

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading form analytics...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Form Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed analysis of form performance and user behavior</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Form Type Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Form Type</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {formTypes.map((formType) => {
            const IconComponent = formType.icon;
            const isSelected = selectedFormType === formType.id;
            return (
              <motion.button
                key={formType.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFormType(formType.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {formType.name}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formData.overview.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
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
              <p className="text-sm font-medium text-gray-600">Form Starts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formData.overview.totalStarts.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
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
              <p className="text-sm font-medium text-gray-600">Completions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formData.overview.totalCompletions.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
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
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formData.overview.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Question Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Detailed Question Analysis</h3>
            <p className="text-gray-600 mt-1">In-depth analysis of form questions performance and user responses</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{formData.questions.length} Questions Analyzed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {formData.questions.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Form Data Available</h3>
              <p className="text-gray-600 max-w-md">
                No form submissions found for this time period. Data will appear here once users start submitting forms.
              </p>
            </div>
          ) : (
            formData.questions.map((question, index) => (
              <motion.div 
                key={question.questionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">Q{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{question.questionText}</h4>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-lg font-bold text-green-700">{question.answerCount}</div>
                    <div className="text-xs text-green-600 font-medium">Answered</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-lg font-bold text-red-700">{question.skipCount}</div>
                    <div className="text-xs text-red-600 font-medium">Skipped</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-lg font-bold text-blue-700">{question.averageTime}s</div>
                    <div className="text-xs text-blue-600 font-medium">Avg Time</div>
                  </div>
                </div>

                {/* Response Rate Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-medium mb-2">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="text-gray-900">
                      {(() => {
                        const total = question.answerCount + question.skipCount;
                        if (total === 0) return 'No Data';
                        return ((question.answerCount / total) * 100).toFixed(1) + '%';
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(() => {
                          const total = question.answerCount + question.skipCount;
                          return total === 0 ? 0 : ((question.answerCount / total) * 100);
                        })()}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Popular Answers */}
                {question.popularAnswers.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Top Responses</h5>
                    {question.popularAnswers.slice(0, 3).map((answer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            idx === 0 ? 'bg-blue-500' : 
                            idx === 1 ? 'bg-green-500' : 'bg-purple-500'
                          }`} />
                          <span className="text-sm text-gray-700 font-medium truncate max-w-[120px]" title={answer.answer}>
                            {answer.answer}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{answer.count}</span>
                          <span className="text-sm font-bold text-gray-900">{answer.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Performance Indicator */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Performance</span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const total = question.answerCount + question.skipCount;
                        if (total === 0) {
                          return (
                            <>
                              <div className="w-4 h-4 bg-gray-300 rounded-full" />
                              <span className="text-xs text-gray-500 font-medium">No Data</span>
                            </>
                          );
                        }
                        const responseRate = (question.answerCount / total) * 100;
                        
                        if (responseRate > 80) {
                          return (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Excellent</span>
                            </>
                          );
                        } else if (responseRate > 60) {
                          return (
                            <>
                              <Activity className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Good</span>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <ArrowDown className="w-4 h-4 text-orange-500" />
                              <span className="text-xs text-orange-600 font-medium">Needs Attention</span>
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* No charts section - replaced with "No Data" states above */}
      </div>

      {/* Device and Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(formData.deviceBreakdown).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No device data available</p>
              </div>
            ) : (
              Object.entries(formData.deviceBreakdown).map(([device, count]) => {
                const total = Object.values(formData.deviceBreakdown).reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const getDeviceIcon = (device: string) => {
                  switch (device.toLowerCase()) {
                    case 'mobile': return Smartphone;
                    case 'tablet': return Tablet;
                    default: return Monitor;
                  }
                };
                const IconComponent = getDeviceIcon(device);
                
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{capitalizeWords(device)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{count.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {Object.entries(formData.geographicData).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full" />
                <p>No geographic data available</p>
              </div>
            ) : (
              Object.entries(formData.geographicData)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([location, count]) => {
                  const total = Object.values(formData.geographicData).reduce((sum, val) => sum + val, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={location} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="font-medium text-gray-900">{location}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{count.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormAnalyticsDashboard;