'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Star,
  Brain,
  Zap,
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Filter,
  Sparkles,
  RefreshCw,
  Settings
} from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'optimization' | 'marketing' | 'conversion' | 'cost-reduction' | 'growth';
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  estimatedValue: number;
  timeframe: string;
  status: 'new' | 'in-progress' | 'completed' | 'dismissed';
  generatedAt: string;
  implementedAt?: string;
  insights: string[];
  metrics: string[];
  aiReasoning: string;
}

interface RecommendationMetrics {
  totalRecommendations: number;
  implemented: number;
  inProgress: number;
  estimatedValue: number;
  actualValue: number;
  avgConfidence: number;
}

const Recommendations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [selectedCategory, selectedPriority]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/ai/recommendations?category=${selectedCategory}&priority=${selectedPriority}`);
      
      if (response.ok) {
        const recommendationsData = await response.json();
        setRecommendations(recommendationsData);
        
        // Calculate metrics from the data
        const calculatedMetrics: RecommendationMetrics = {
          totalRecommendations: recommendationsData.length,
          implemented: recommendationsData.filter((r: Recommendation) => r.status === 'completed').length,
          inProgress: recommendationsData.filter((r: Recommendation) => r.status === 'in-progress').length,
          estimatedValue: recommendationsData.reduce((sum: number, r: Recommendation) => sum + r.estimatedValue, 0),
          actualValue: recommendationsData
            .filter((r: Recommendation) => r.status === 'completed')
            .reduce((sum: number, r: Recommendation) => sum + r.estimatedValue, 0),
          avgConfidence: recommendationsData.length > 0 
            ? recommendationsData.reduce((sum: number, r: Recommendation) => sum + r.confidence, 0) / recommendationsData.length
            : 0
        };
        
        setMetrics(calculatedMetrics);
      } else {
        console.error('Failed to load recommendations');
        setRecommendations([]);
        setMetrics({
          totalRecommendations: 0,
          implemented: 0,
          inProgress: 0,
          estimatedValue: 0,
          actualValue: 0,
          avgConfidence: 0
        });
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
      setMetrics({
        totalRecommendations: 0,
        implemented: 0,
        inProgress: 0,
        estimatedValue: 0,
        actualValue: 0,
        avgConfidence: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Generated recommendations:', result);
        // Reload recommendations after generation
        await loadRecommendations();
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateRecommendationStatus = async (id: string, status: Recommendation['status']) => {
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update_status',
          id,
          status
        }),
      });
      
      if (response.ok) {
        // Update local state
        setRecommendations(prev => prev.map(rec => 
          rec.id === id ? { 
            ...rec, 
            status,
            implementedAt: (status === 'completed' || status === 'in-progress') ? new Date().toISOString() : rec.implementedAt
          } : rec
        ));
      }
    } catch (error) {
      console.error('Error updating recommendation status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'optimization': return 'text-purple-600 bg-purple-100';
      case 'marketing': return 'text-blue-600 bg-blue-100';
      case 'conversion': return 'text-green-600 bg-green-100';
      case 'cost-reduction': return 'text-orange-600 bg-orange-100';
      case 'growth': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'optimization', name: 'Optimization' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'conversion', name: 'Conversion' },
    { id: 'cost-reduction', name: 'Cost Reduction' },
    { id: 'growth', name: 'Growth' }
  ];

  const priorities = [
    { id: 'all', name: 'All Priorities' },
    { id: 'high', name: 'High Priority' },
    { id: 'medium', name: 'Medium Priority' },
    { id: 'low', name: 'Low Priority' }
  ];

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || rec.priority === selectedPriority;
    return matchesCategory && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading AI recommendations...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600 mt-1">Data-driven insights to optimize your solar business</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateNewRecommendations}
          disabled={isGenerating}
          className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#146443' }}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate New
            </>
          )}
        </motion.button>
      </div>

      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRecommendations}</p>
                <p className="text-sm text-gray-600">Total Recommendations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.implemented}</p>
                <p className="text-sm text-gray-600">Implemented</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">€{metrics.estimatedValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Estimated Value</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Brain className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgConfidence.toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Avg Confidence</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredRecommendations.length} of {recommendations.length} recommendations
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority} priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                      {recommendation.impact} impact
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                      {recommendation.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{recommendation.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Estimated Value:</span>
                    <p className="font-semibold text-gray-900">€{recommendation.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Timeframe:</span>
                    <p className="font-semibold text-gray-900">{recommendation.timeframe}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <p className="font-semibold text-gray-900">{recommendation.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Effort:</span>
                    <p className="font-semibold text-gray-900 capitalize">{recommendation.effort}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI Reasoning:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{recommendation.aiReasoning}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights:</h4>
                  <ul className="space-y-1">
                    {recommendation.insights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {recommendation.metrics.map((metric, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(recommendation.status)}`}>
                  {recommendation.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Generated {new Date(recommendation.generatedAt).toLocaleDateString()}
                {recommendation.implementedAt && (
                  <span> • Implemented {new Date(recommendation.implementedAt).toLocaleDateString()}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {recommendation.status === 'new' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateRecommendationStatus(recommendation.id, 'in-progress')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Start Implementation
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateRecommendationStatus(recommendation.id, 'dismissed')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
                    </motion.button>
                  </>
                )}
                
                {recommendation.status === 'in-progress' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateRecommendationStatus(recommendation.id, 'completed')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    Mark Complete
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Found</h3>
          <p className="text-gray-600">Try adjusting your filters or generate new recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;