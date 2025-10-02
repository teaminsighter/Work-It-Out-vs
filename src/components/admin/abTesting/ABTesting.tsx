'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ChartBarIcon,
  CodeBracketIcon,
  EyeIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ABTestingService, { TestResults } from '@/lib/services/abTestingService';
import { StatisticsService } from '@/lib/services/statisticsService';

interface ABTest {
  id: string;
  name: string;
  description?: string;
  url: string;
  urlMatchType: 'EXACT' | 'PATTERN' | 'REGEX';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  assignmentType: 'FIFTY_FIFTY' | 'ALTERNATING' | 'CUSTOM_SPLIT';
  customSplitA: number;
  customSplitB: number;
  landingPageA: any;
  landingPageB: any;
  visitsA: number;
  visitsB: number;
  conversionsA: number;
  conversionsB: number;
  conversionRateA: number;
  conversionRateB: number;
  statisticalSignificance: boolean;
  confidenceLevel: number;
  winnerVariant?: 'A' | 'B';
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface ABTestTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  variables?: any;
  usageCount: number;
  isPublic: boolean;
}

const ABTesting = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [templates, setTemplates] = useState<ABTestTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'templates'>('overview');

  // Create test form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    url: '',
    urlMatchType: 'EXACT' as 'EXACT' | 'PATTERN' | 'REGEX',
    assignmentType: 'ALTERNATING' as 'FIFTY_FIFTY' | 'ALTERNATING' | 'CUSTOM_SPLIT',
    customSplitA: 50,
    customSplitB: 50,
    confidenceLevel: 95,
    landingPageA: { html: '', css: '', js: '' },
    landingPageB: { html: '', css: '', js: '' }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [testsData, templatesData] = await Promise.all([
        ABTestingService.getAllTests(),
        loadTemplates()
      ]);
      setTests(testsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    // Mock templates for now - will be replaced with API call
    return [
      {
        id: '1',
        name: 'Hero Section A',
        description: 'Conversion-focused hero with large CTA',
        category: 'Hero Sections',
        htmlContent: '<div class="hero">...</div>',
        cssContent: '.hero { background: linear-gradient(...) }',
        jsContent: '',
        variables: {},
        usageCount: 12,
        isPublic: true
      }
    ];
  };

  const handleCreateTest = async () => {
    try {
      const testId = await ABTestingService.createTest({
        ...createForm,
        createdBy: 'current-user-id' // Replace with actual user ID
      });
      
      await loadData();
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      url: '',
      urlMatchType: 'EXACT',
      assignmentType: 'ALTERNATING',
      customSplitA: 50,
      customSplitB: 50,
      confidenceLevel: 95,
      landingPageA: { html: '', css: '', js: '' },
      landingPageB: { html: '', css: '', js: '' }
    });
  };

  const handleStartTest = async (testId: string) => {
    await ABTestingService.startTest(testId);
    await loadData();
  };

  const handlePauseTest = async (testId: string) => {
    await ABTestingService.pauseTest(testId);
    await loadData();
  };

  const handleStopTest = async (testId: string) => {
    await ABTestingService.stopTest(testId);
    await loadData();
  };

  const handleViewResults = async (test: ABTest) => {
    setSelectedTest(test);
    const results = await ABTestingService.getTestResults(test.id);
    setTestResults(results);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateImprovement = (rateA: number, rateB: number) => {
    if (rateA === 0) return rateB > 0 ? 100 : 0;
    return ((rateB - rateA) / rateA) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading A/B tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
          <p className="text-gray-600">Create, manage, and analyze A/B tests with statistical insights</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Test
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Test Overview', icon: ChartBarIcon },
            { key: 'templates', label: 'Templates', icon: CodeBracketIcon }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">{tests.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PlayIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tests.filter(t => t.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrophyIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tests.filter(t => t.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Significant</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tests.filter(t => t.statisticalSignificance).length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tests Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Test Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Assignment</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Visitors</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Conversions</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Improvement</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Significance</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tests.map((test) => {
                    const improvement = calculateImprovement(test.conversionRateA, test.conversionRateB);
                    const totalVisitors = test.visitsA + test.visitsB;
                    
                    return (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{test.name}</div>
                            <div className="text-sm text-gray-500">{test.url}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                            {test.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {test.assignmentType === 'ALTERNATING' ? 'A-B-A-B' : 
                           test.assignmentType === 'FIFTY_FIFTY' ? '50/50' :
                           `${test.customSplitA}/${test.customSplitB}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>A: {test.visitsA.toLocaleString()}</div>
                            <div>B: {test.visitsB.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Total: {totalVisitors.toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>A: {test.conversionsA} ({(test.conversionRateA * 100).toFixed(2)}%)</div>
                            <div>B: {test.conversionsB} ({(test.conversionRateB * 100).toFixed(2)}%)</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${
                            improvement > 0 ? 'text-green-600' : 
                            improvement < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {improvement > 0 ? '+' : ''}{improvement.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {test.statisticalSignificance ? (
                            <div className="flex items-center">
                              <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-sm text-green-600">Yes</span>
                            </div>
                          ) : totalVisitors > 100 ? (
                            <div className="flex items-center">
                              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mr-1" />
                              <span className="text-sm text-yellow-600">Pending</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">Too early</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewResults(test)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Results"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            
                            {test.status === 'DRAFT' && (
                              <button
                                onClick={() => handleStartTest(test.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Start Test"
                              >
                                <PlayIcon className="w-4 h-4" />
                              </button>
                            )}
                            
                            {test.status === 'ACTIVE' && (
                              <>
                                <button
                                  onClick={() => handlePauseTest(test.id)}
                                  className="text-yellow-600 hover:text-yellow-800"
                                  title="Pause Test"
                                >
                                  <PauseIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStopTest(test.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Stop Test"
                                >
                                  <StopIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            {test.status === 'PAUSED' && (
                              <button
                                onClick={() => handleStartTest(test.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Resume Test"
                              >
                                <PlayIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {tests.length === 0 && (
              <div className="text-center py-12">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">No A/B tests yet</div>
                <div className="text-sm text-gray-500 mb-4">
                  Create your first A/B test to start optimizing conversions
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Your First Test
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Landing Page Templates</h2>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                  </div>
                  <span className="text-xs text-gray-400">Used {template.usageCount}x</span>
                </div>
                <p className="text-sm text-gray-700 mt-3">{template.description}</p>
                <div className="mt-4 flex items-center space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">Use Template</button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">Preview</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Create A/B Test</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
                      <input
                        type="text"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Homepage Hero Test"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                      <input
                        type="text"
                        value={createForm.url}
                        onChange={(e) => setCreateForm({...createForm, url: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="/landing-page"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Testing different hero sections to improve conversion rate..."
                    />
                  </div>

                  {/* Test Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL Matching</label>
                      <select
                        value={createForm.urlMatchType}
                        onChange={(e) => setCreateForm({...createForm, urlMatchType: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="EXACT">Exact Match</option>
                        <option value="PATTERN">Wildcard Pattern</option>
                        <option value="REGEX">Regular Expression</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Strategy</label>
                      <select
                        value={createForm.assignmentType}
                        onChange={(e) => setCreateForm({...createForm, assignmentType: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="ALTERNATING">A-B-A-B Pattern</option>
                        <option value="FIFTY_FIFTY">50/50 Random</option>
                        <option value="CUSTOM_SPLIT">Custom Split</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
                      <select
                        value={createForm.confidenceLevel}
                        onChange={(e) => setCreateForm({...createForm, confidenceLevel: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value={90}>90%</option>
                        <option value={95}>95% (Recommended)</option>
                        <option value={99}>99%</option>
                      </select>
                    </div>
                  </div>

                  {/* Landing Page Variants */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Variant A (Control)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">HTML Content</label>
                          <textarea
                            value={createForm.landingPageA.html}
                            onChange={(e) => setCreateForm({
                              ...createForm,
                              landingPageA: {...createForm.landingPageA, html: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                            rows={4}
                            placeholder="<div class='hero'>...</div>"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">CSS Styles</label>
                          <textarea
                            value={createForm.landingPageA.css}
                            onChange={(e) => setCreateForm({
                              ...createForm,
                              landingPageA: {...createForm.landingPageA, css: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                            rows={3}
                            placeholder=".hero { background: blue; }"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Variant B (Test)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">HTML Content</label>
                          <textarea
                            value={createForm.landingPageB.html}
                            onChange={(e) => setCreateForm({
                              ...createForm,
                              landingPageB: {...createForm.landingPageB, html: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                            rows={4}
                            placeholder="<div class='hero-v2'>...</div>"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">CSS Styles</label>
                          <textarea
                            value={createForm.landingPageB.css}
                            onChange={(e) => setCreateForm({
                              ...createForm,
                              landingPageB: {...createForm.landingPageB, css: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                            rows={3}
                            placeholder=".hero-v2 { background: green; }"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCreateTest}
                  disabled={!createForm.name || !createForm.url}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create Test
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Modal */}
      {selectedTest && testResults && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedTest(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedTest.name} - Results</h3>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Statistical Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-900">
                        {testResults.statistics.improvement > 0 ? '+' : ''}{testResults.statistics.improvementPercent.toFixed(2)}%
                      </div>
                      <div className="text-sm text-blue-700">Improvement</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-900">
                        {testResults.statistics.confidenceLevel}%
                      </div>
                      <div className="text-sm text-green-700">Confidence Level</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-900">
                        {(testResults.assignments.totalA + testResults.assignments.totalB).toLocaleString()}
                      </div>
                      <div className="text-sm text-purple-700">Total Visitors</div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-900">
                        {testResults.statistics.isSignificant ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-yellow-700">Statistically Significant</div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Variant A (Control)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Visitors:</span>
                          <span className="font-medium">{testResults.assignments.totalA.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversions:</span>
                          <span className="font-medium">{testResults.assignments.conversionsA}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span className="font-medium">{(testResults.statistics.conversionRateA * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Variant B (Test)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Visitors:</span>
                          <span className="font-medium">{testResults.assignments.totalB.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversions:</span>
                          <span className="font-medium">{testResults.assignments.conversionsB}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span className="font-medium">{(testResults.statistics.conversionRateB * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <div className="flex items-start">
                      {testResults.recommendations.shouldStop ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-gray-700">{testResults.recommendations.reason}</p>
                        {testResults.recommendations.winner && (
                          <p className="text-sm font-medium text-green-700 mt-1">
                            Winner: Variant {testResults.recommendations.winner}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTesting;