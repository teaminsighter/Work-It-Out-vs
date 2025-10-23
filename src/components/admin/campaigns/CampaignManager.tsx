'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  GlobeAltIcon,
  EyeIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  campaignUrl: string;
  variants: CampaignVariant[];
  conversionGoal: string;
  totalVisitors: number;
  totalConversions: number;
  conversionRate: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

interface CampaignVariant {
  id: string;
  name: string;
  landingPageId: string;
  landingPageName: string;
  landingPageSlug: string;
  trafficPercentage: number;
  visitors: number;
  conversions: number;
  conversionRate: number;
  isControl: boolean;
}

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  status: string;
}

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Create campaign form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    campaignUrl: '',
    conversionGoal: 'form_submission',
    variants: [
      { 
        name: 'Control (Original)', 
        landingPageId: '', 
        landingPageName: '',
        landingPageSlug: '',
        trafficPercentage: 50,
        isControl: true 
      },
      { 
        name: 'Variant A', 
        landingPageId: '', 
        landingPageName: '',
        landingPageSlug: '',
        trafficPercentage: 50,
        isControl: false 
      }
    ]
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsData, pagesData] = await Promise.all([
        loadCampaigns(),
        loadLandingPages()
      ]);
      setCampaigns(campaignsData);
      setLandingPages(pagesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const result = await response.json();
      if (result.campaigns) {
        return result.campaigns;
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
    
    // Return mock data as fallback
    return [
      {
        id: '1',
        name: 'Health Insurance Landing Page Test',
        description: 'Testing different hero sections for health insurance conversions',
        status: 'ACTIVE',
        campaignUrl: '/health-special-offer',
        variants: [
          {
            id: 'v1',
            name: 'Control (Trust-focused)',
            landingPageId: 'page-1',
            landingPageName: 'Health Insurance - Trust Theme',
            landingPageSlug: '/health',
            trafficPercentage: 50,
            visitors: 2430,
            conversions: 89,
            conversionRate: 3.66,
            isControl: true
          },
          {
            id: 'v2',
            name: 'Variant A (Savings-focused)',
            landingPageId: 'page-2',
            landingPageName: 'Health Insurance - Savings Theme',
            landingPageSlug: '/health/savings-focus',
            trafficPercentage: 50,
            visitors: 2381,
            conversions: 127,
            conversionRate: 5.34,
            isControl: false
          }
        ],
        conversionGoal: 'form_submission',
        totalVisitors: 4811,
        totalConversions: 216,
        conversionRate: 4.49,
        createdAt: '2024-09-28T14:30:00Z'
      }
    ];
  };

  const loadLandingPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const result = await response.json();
      if (result.pages) {
        return result.pages.map((page: any) => ({
          id: page.id,
          name: page.name,
          slug: page.slug,
          status: page.status
        }));
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
    return [];
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!createForm.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    
    if (!createForm.campaignUrl.trim()) {
      newErrors.campaignUrl = 'Campaign URL is required';
    } else if (!createForm.campaignUrl.startsWith('/')) {
      newErrors.campaignUrl = 'Campaign URL must start with /';
    }

    // Check if all variants have landing pages selected
    createForm.variants.forEach((variant, index) => {
      if (!variant.landingPageId) {
        newErrors[`variant_${index}_page`] = `Landing page required for ${variant.name}`;
      }
    });

    // Check if traffic percentages add up to 100
    const totalTraffic = createForm.variants.reduce((sum, variant) => sum + variant.trafficPercentage, 0);
    if (totalTraffic !== 100) {
      newErrors.traffic = `Traffic distribution must add up to 100% (currently ${totalTraffic}%)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCampaign = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Update variant landing page names
      const updatedVariants = createForm.variants.map(variant => {
        const selectedPage = landingPages.find(page => page.id === variant.landingPageId);
        return {
          ...variant,
          landingPageName: selectedPage?.name || variant.landingPageName
        };
      });

      const campaignData = {
        ...createForm,
        variants: updatedVariants,
        status: 'DRAFT',
        createdBy: 'current-user-id'
      };
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        await loadData();
        setShowCreateModal(false);
        resetCreateForm();
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to create campaign' });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      campaignUrl: '',
      conversionGoal: 'form_submission',
      variants: [
        { 
          name: 'Control (Original)', 
          landingPageId: '', 
          landingPageName: '',
          landingPageSlug: '/health',
          trafficPercentage: 50,
          isControl: true 
        },
        { 
          name: 'Variant A', 
          landingPageId: '', 
          landingPageName: '',
          landingPageSlug: '/health/variant-a',
          trafficPercentage: 50,
          isControl: false 
        }
      ]
    });
    setErrors({});
  };

  const addVariant = () => {
    const newVariant = {
      name: `Variant ${String.fromCharCode(65 + createForm.variants.length - 1)}`,
      landingPageId: '',
      landingPageName: '',
      landingPageSlug: '',
      trafficPercentage: Math.floor(100 / (createForm.variants.length + 1)),
      isControl: false
    };
    
    // Redistribute traffic equally
    const totalVariants = createForm.variants.length + 1;
    const equalPercentage = Math.floor(100 / totalVariants);
    
    setCreateForm(prev => ({
      ...prev,
      variants: [
        ...prev.variants.map(v => ({ ...v, trafficPercentage: equalPercentage })),
        { ...newVariant, trafficPercentage: equalPercentage }
      ]
    }));
  };

  const removeVariant = (index: number) => {
    if (createForm.variants.length <= 2) return; // Minimum 2 variants
    
    setCreateForm(prev => {
      const newVariants = prev.variants.filter((_, i) => i !== index);
      const equalPercentage = Math.floor(100 / newVariants.length);
      
      return {
        ...prev,
        variants: newVariants.map(v => ({ ...v, trafficPercentage: equalPercentage }))
      };
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setCreateForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i === index) {
          const updated = { ...v, [field]: value };
          
          // Auto-update landing page slug when landing page changes
          if (field === 'landingPageId') {
            const selectedPage = landingPages.find(page => page.id === value);
            if (selectedPage) {
              updated.landingPageSlug = `/${selectedPage.slug}`;
            }
            updated.landingPageName = selectedPage?.name || '';
          }
          
          return updated;
        }
        return v;
      })
    }));
  };

  const updateTrafficDistribution = (index: number, percentage: number) => {
    const newVariants = [...createForm.variants];
    newVariants[index].trafficPercentage = percentage;
    
    // Auto-adjust other variants to maintain 100%
    const remaining = 100 - percentage;
    const otherVariants = newVariants.filter((_, i) => i !== index);
    const remainingPerVariant = Math.floor(remaining / otherVariants.length);
    
    otherVariants.forEach((variant, i) => {
      const variantIndex = newVariants.findIndex(v => v === variant);
      newVariants[variantIndex].trafficPercentage = remainingPerVariant;
    });
    
    setCreateForm(prev => ({ ...prev, variants: newVariants }));
  };

  const handleCampaignAction = async (campaignId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      const response = await fetch(`/api/campaigns?id=${campaignId}&action=${action}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
    }
  };


  const conversionGoalOptions = [
    { value: 'form_submission', label: 'Form Submission' },
    { value: 'phone_number_provided', label: 'Phone Number Provided' },
    { value: 'email_signup', label: 'Email Signup' },
    { value: 'quote_request', label: 'Quote Request' },
    { value: 'sms_verification', label: 'SMS Verification Complete' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
          <p className="text-gray-600">Create and manage A/B testing campaigns for your landing pages</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">{campaigns.length}</p>
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
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.filter(c => c.status === 'ACTIVE').length}
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
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Visitors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.totalVisitors, 0).toLocaleString()}
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
              <TrophyIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Conversion</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.length > 0 
                  ? (campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Campaign</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Campaign URL</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Variants</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Performance</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                      campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {campaign.campaignUrl}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Visitors go to: <span className="font-medium">yoursite.com{campaign.campaignUrl}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      {campaign.variants?.map(variant => (
                        <div key={variant.id} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${variant.isControl ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                          <span className="text-xs">{variant.name} ({variant.trafficPercentage}%)</span>
                        </div>
                      )) || <span className="text-gray-400">No variants</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Visitors: {campaign.totalVisitors.toLocaleString()}</div>
                      <div>Conversions: {campaign.totalConversions}</div>
                      <div>Rate: {campaign.conversionRate.toFixed(2)}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      
                      {campaign.status === 'DRAFT' && (
                        <button
                          onClick={() => handleCampaignAction(campaign.id, 'start')}
                          className="text-green-600 hover:text-green-800"
                          title="Start Campaign"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      {campaign.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => handleCampaignAction(campaign.id, 'pause')}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Pause Campaign"
                          >
                            <PauseIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCampaignAction(campaign.id, 'stop')}
                            className="text-red-600 hover:text-red-800"
                            title="Stop Campaign"
                          >
                            <StopIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {campaign.status === 'PAUSED' && (
                        <button
                          onClick={() => handleCampaignAction(campaign.id, 'start')}
                          className="text-green-600 hover:text-green-800"
                          title="Resume Campaign"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        className="text-gray-600 hover:text-gray-800"
                        title="Duplicate Campaign"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">No campaigns yet</div>
            <div className="text-sm text-gray-500 mb-4">
              Create your first campaign to start A/B testing your landing pages
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </button>
          </div>
        )}
      </motion.div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Create A/B Testing Campaign</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                      <input
                        type="text"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Health Insurance Hero Test"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Campaign URL *</label>
                      <input
                        type="text"
                        value={createForm.campaignUrl}
                        onChange={(e) => setCreateForm({...createForm, campaignUrl: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.campaignUrl ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="/health-special-offer"
                      />
                      {errors.campaignUrl && <p className="text-red-500 text-xs mt-1">{errors.campaignUrl}</p>}
                      <p className="text-xs text-gray-500 mt-1">Visitors will access your campaign at this URL</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Describe what you're testing and your hypothesis..."
                    />
                  </div>

                  {/* Conversion Goal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Goal</label>
                    <select
                      value={createForm.conversionGoal}
                      onChange={(e) => setCreateForm({...createForm, conversionGoal: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {conversionGoalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Variants Configuration */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Landing Page Variants</h4>
                      <button
                        onClick={addVariant}
                        className="text-sm text-green-600 hover:text-green-800"
                        disabled={createForm.variants.length >= 5}
                      >
                        + Add Variant
                      </button>
                    </div>
                    
                    {errors.traffic && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.traffic}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {createForm.variants.map((variant, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">
                              {variant.isControl ? '🔵 Control Variant' : '🟢 Test Variant'} - {variant.name}
                            </h5>
                            {!variant.isControl && createForm.variants.length > 2 && (
                              <button
                                onClick={() => removeVariant(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Variant Name</label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Landing Page *</label>
                              <select
                                value={variant.landingPageId}
                                onChange={(e) => updateVariant(index, 'landingPageId', e.target.value)}
                                className={`w-full px-3 py-2 border rounded text-sm ${
                                  errors[`variant_${index}_page`] ? 'border-red-300' : 'border-gray-300'
                                }`}
                              >
                                <option value="">Select Page...</option>
                                {landingPages.map(page => (
                                  <option key={page.id} value={page.id}>
                                    {page.name} ({page.status})
                                  </option>
                                ))}
                              </select>
                              {errors[`variant_${index}_page`] && (
                                <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_page`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">URL Path</label>
                              <input
                                type="text"
                                value={variant.landingPageSlug}
                                onChange={(e) => updateVariant(index, 'landingPageSlug', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <label className="block text-xs text-gray-600 mb-1">
                              Traffic Allocation: {variant.trafficPercentage}%
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="80"
                              value={variant.trafficPercentage}
                              onChange={(e) => updateTrafficDistribution(index, parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>10%</span>
                              <span>80%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Traffic Distribution Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Traffic Distribution Summary</h4>
                    <div className="space-y-2">
                      {createForm.variants.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{variant.name}</span>
                          <span className="text-sm font-medium">{variant.trafficPercentage}%</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between items-center font-medium">
                        <span>Total</span>
                        <span className={`${
                          createForm.variants.reduce((sum, v) => sum + v.trafficPercentage, 0) === 100 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {createForm.variants.reduce((sum, v) => sum + v.trafficPercentage, 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCreateCampaign}
                  disabled={!createForm.name || createForm.variants.some(v => !v.landingPageId)}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create Campaign
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

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedCampaign(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedCampaign.name} - Campaign Details</h3>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Campaign Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedCampaign.totalVisitors.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-700">Total Visitors</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-900">
                        {selectedCampaign.totalConversions}
                      </div>
                      <div className="text-sm text-green-700">Total Conversions</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-900">
                        {selectedCampaign.conversionRate.toFixed(2)}%
                      </div>
                      <div className="text-sm text-purple-700">Conversion Rate</div>
                    </div>
                  </div>

                  {/* Variant Performance */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Variant Performance</h4>
                    <div className="space-y-4">
                      {selectedCampaign.variants?.map(variant => (
                        <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900">{variant.name}</h5>
                              <p className="text-sm text-gray-500">{variant.landingPageName}</p>
                              <p className="text-xs text-gray-400">{variant.landingPageSlug}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{variant.trafficPercentage}% traffic</div>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                variant.isControl 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {variant.isControl ? 'Control' : 'Variant'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <div className="text-lg font-bold text-gray-900">{variant.visitors.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Visitors</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{variant.conversions}</div>
                              <div className="text-xs text-gray-500">Conversions</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{variant.conversionRate.toFixed(2)}%</div>
                              <div className="text-xs text-gray-500">Rate</div>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">No variant data available</p>}
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

export default CampaignManager;