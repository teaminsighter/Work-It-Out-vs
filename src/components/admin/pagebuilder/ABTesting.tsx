'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ABTestVariant {
  id: string;
  name: string;
  traffic_percentage: number;
  page_url: string;
  metrics: {
    visitors: number;
    conversions: number;
    conversion_rate: number;
    revenue: number;
    bounce_rate: number;
  };
  status: 'running' | 'paused' | 'winner' | 'loser';
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  goal: 'conversion_rate' | 'revenue' | 'engagement' | 'lead_generation';
  status: 'draft' | 'running' | 'completed' | 'paused';
  created_at: string;
  started_at?: string;
  ended_at?: string;
  variants: ABTestVariant[];
  settings: {
    confidence_level: number;
    minimum_sample_size: number;
    max_duration_days: number;
    significance_reached: boolean;
  };
  winner?: string;
  statistical_significance: number;
}

const ABTesting = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'results'>('dashboard');
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const [tests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Solar Calculator - Hero Section',
      description: 'Testing different hero headlines and CTA buttons',
      goal: 'conversion_rate',
      status: 'running',
      created_at: '2024-09-20T10:00:00Z',
      started_at: '2024-09-21T09:00:00Z',
      variants: [
        {
          id: 'control',
          name: 'Control (Original)',
          traffic_percentage: 50,
          page_url: '/solar-calculator',
          metrics: {
            visitors: 7856,
            conversions: 327,
            conversion_rate: 4.16,
            revenue: 98100,
            bounce_rate: 23.4
          },
          status: 'running'
        },
        {
          id: 'variant-a',
          name: 'Green Theme + Urgency',
          traffic_percentage: 50,
          page_url: '/solar-calculator?variant=green',
          metrics: {
            visitors: 7923,
            conversions: 389,
            conversion_rate: 4.91,
            revenue: 116700,
            bounce_rate: 21.8
          },
          status: 'running'
        }
      ],
      settings: {
        confidence_level: 95,
        minimum_sample_size: 1000,
        max_duration_days: 30,
        significance_reached: true
      },
      statistical_significance: 97.3
    },
    {
      id: '2',
      name: 'Battery Landing - Pricing Display',
      description: 'Testing monthly vs annual pricing presentation',
      goal: 'lead_generation',
      status: 'completed',
      created_at: '2024-09-15T14:30:00Z',
      started_at: '2024-09-16T09:00:00Z',
      ended_at: '2024-09-25T18:00:00Z',
      variants: [
        {
          id: 'control',
          name: 'Monthly Pricing',
          traffic_percentage: 50,
          page_url: '/battery-storage',
          metrics: {
            visitors: 5234,
            conversions: 167,
            conversion_rate: 3.19,
            revenue: 50100,
            bounce_rate: 28.7
          },
          status: 'loser'
        },
        {
          id: 'variant-b',
          name: 'Annual Savings Focus',
          traffic_percentage: 50,
          page_url: '/battery-storage?pricing=annual',
          metrics: {
            visitors: 5189,
            conversions: 234,
            conversion_rate: 4.51,
            revenue: 70200,
            bounce_rate: 24.2
          },
          status: 'winner'
        }
      ],
      settings: {
        confidence_level: 95,
        minimum_sample_size: 800,
        max_duration_days: 14,
        significance_reached: true
      },
      winner: 'variant-b',
      statistical_significance: 99.1
    },
    {
      id: '3',
      name: 'Contact Form - Fields Optimization',
      description: 'Testing 3-field vs 5-field contact form',
      goal: 'conversion_rate',
      status: 'draft',
      created_at: '2024-09-25T16:45:00Z',
      variants: [
        {
          id: 'control',
          name: '5 Fields (Current)',
          traffic_percentage: 50,
          page_url: '/contact',
          metrics: {
            visitors: 0,
            conversions: 0,
            conversion_rate: 0,
            revenue: 0,
            bounce_rate: 0
          },
          status: 'running'
        },
        {
          id: 'variant-c',
          name: '3 Fields (Minimal)',
          traffic_percentage: 50,
          page_url: '/contact?form=minimal',
          metrics: {
            visitors: 0,
            conversions: 0,
            conversion_rate: 0,
            revenue: 0,
            bounce_rate: 0
          },
          status: 'running'
        }
      ],
      settings: {
        confidence_level: 95,
        minimum_sample_size: 500,
        max_duration_days: 21,
        significance_reached: false
      },
      statistical_significance: 0
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVariantStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'winner': return 'bg-green-100 text-green-800';
      case 'loser': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
          <p className="text-gray-600">Optimize conversion rates with data-driven experiments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveView('create')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          🧪 Create New Test
        </motion.button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'create', name: 'Create Test', icon: '🧪' },
          { id: 'results', name: 'Results', icon: '📈' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeView === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </motion.button>
        ))}
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Active Tests', value: '2', change: '+1 this week', color: 'orange' },
              { title: 'Avg Lift', value: '+18.2%', change: 'Conversion rate', color: 'green' },
              { title: 'Total Visitors', value: '26.2K', change: 'Last 30 days', color: 'blue' },
              { title: 'Revenue Impact', value: '€284K', change: '+€47K vs control', color: 'purple' }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{metric.title}</div>
                <div className="text-xs text-gray-500">{metric.change}</div>
              </motion.div>
            ))}
          </div>

          {/* Active Tests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Current Tests</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {tests.filter(t => t.status === 'running').length} running
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {tests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTest(test);
                    setActiveView('results');
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{test.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Goal: {test.goal.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Confidence: {test.settings.confidence_level}%</span>
                        {test.settings.significance_reached && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">
                              {test.statistical_significance.toFixed(1)}% significant
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variants Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map((variant) => (
                      <div key={variant.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{variant.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariantStatusColor(variant.status)}`}>
                            {variant.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-gray-500">Visitors</div>
                            <div className="font-medium">{variant.metrics.visitors.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Conv. Rate</div>
                            <div className="font-medium">{variant.metrics.conversion_rate.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Revenue</div>
                            <div className="font-medium">€{(variant.metrics.revenue / 1000).toFixed(0)}K</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Test View */}
      {activeView === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Create New A/B Test</h3>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="e.g., Homepage Hero CTA Test"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option>Conversion Rate</option>
                  <option>Revenue</option>
                  <option>Lead Generation</option>
                  <option>Engagement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Describe what you're testing and why..."
              />
            </div>

            {/* Test Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Test Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option>95%</option>
                    <option>90%</option>
                    <option>99%</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Sample Size</label>
                  <input 
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration (days)</label>
                  <input 
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Variants</h4>
              
              {[
                { name: 'Control (Original)', traffic: 50 },
                { name: 'Variant A', traffic: 50 }
              ].map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Variant Name</label>
                      <input 
                        defaultValue={variant.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Traffic %</label>
                      <input 
                        type="number"
                        defaultValue={variant.traffic}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page URL</label>
                      <input 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                        placeholder="/landing-page"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create & Start Test
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results View */}
      {activeView === 'results' && selectedTest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Test Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedTest.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTest.status)}`}>
                    {selectedTest.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{selectedTest.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Started: {new Date(selectedTest.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Goal: {selectedTest.goal.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>Confidence: {selectedTest.settings.confidence_level}%</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  ← Back
                </motion.button>
              </div>
            </div>

            {/* Statistical Significance */}
            {selectedTest.settings.significance_reached && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Statistical Significance Reached</span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  This test has reached {selectedTest.statistical_significance.toFixed(1)}% statistical significance. 
                  {selectedTest.winner && ` Variant "${selectedTest.variants.find(v => v.id === selectedTest.winner)?.name}" is the winner.`}
                </p>
              </div>
            )}
          </div>

          {/* Variants Performance Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Comparison</h3>
            
            <div className="space-y-6">
              {selectedTest.variants.map((variant) => (
                <div key={variant.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{variant.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariantStatusColor(variant.status)}`}>
                        {variant.status}
                      </span>
                      <span className="text-sm text-gray-500">{variant.traffic_percentage}% traffic</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[
                      { label: 'Visitors', value: variant.metrics.visitors.toLocaleString(), color: 'gray' },
                      { label: 'Conversions', value: variant.metrics.conversions.toLocaleString(), color: 'blue' },
                      { label: 'Conversion Rate', value: `${variant.metrics.conversion_rate.toFixed(2)}%`, color: 'green' },
                      { label: 'Revenue', value: `€${(variant.metrics.revenue / 1000).toFixed(0)}K`, color: 'purple' },
                      { label: 'Bounce Rate', value: `${variant.metrics.bounce_rate.toFixed(1)}%`, color: 'red' }
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                        <div className="text-sm text-gray-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Test Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600">Confidence Level</div>
                <div className="font-medium text-gray-900">{selectedTest.settings.confidence_level}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Min Sample Size</div>
                <div className="font-medium text-gray-900">{selectedTest.settings.minimum_sample_size.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Max Duration</div>
                <div className="font-medium text-gray-900">{selectedTest.settings.max_duration_days} days</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Significance</div>
                <div className={`font-medium ${selectedTest.settings.significance_reached ? 'text-green-600' : 'text-gray-900'}`}>
                  {selectedTest.statistical_significance.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ABTesting;