'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Eye,
  MousePointer,
  ExternalLink
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  startDate: string;
  endDate: string;
}

interface AddressData {
  address: string;
  count: number;
  percentage: number;
}

const MarketingAnalytics = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [topAddresses, setTopAddresses] = useState<AddressData[]>([]);

  useEffect(() => {
    loadMarketingData();
  }, [dateRange]);

  const loadMarketingData = async () => {
    setIsLoading(true);
    
    // Load address analytics data
    try {
      const response = await fetch(`/api/analytics/address-analytics?range=${dateRange}`);
      const result = await response.json();
      
      if (result.success) {
        setTopAddresses(result.data.topAddresses.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading address analytics:', error);
    }
    
    // Set empty campaigns for production - real campaign data would come from API
    const campaigns: Campaign[] = [];
    
    setTimeout(() => {
      setCampaigns(campaigns);
      setIsLoading(false);
    }, 1000);
  };

  const filteredCampaigns = selectedPlatform === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.platform.toLowerCase().includes(selectedPlatform.toLowerCase()));

  // Calculate aggregate metrics
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = filteredCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCTR = filteredCampaigns.length > 0 ? 
    filteredCampaigns.reduce((sum, c) => sum + c.ctr, 0) / filteredCampaigns.length : 0;
  const avgROAS = filteredCampaigns.length > 0 ? 
    filteredCampaigns.reduce((sum, c) => sum + c.roas, 0) / filteredCampaigns.length : 0;

  const aggregateMetrics = [
    {
      title: 'Total Budget',
      value: `€${totalBudget.toLocaleString()}`,
      change: totalSpent > 0 ? `€${totalSpent.toLocaleString()} spent` : 'No campaigns active',
      trend: totalSpent < totalBudget ? 'positive' : 'neutral',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Impressions',
      value: totalImpressions.toLocaleString(),
      change: filteredCampaigns.length > 0 ? `${filteredCampaigns.length} campaigns` : 'No campaigns',
      trend: 'neutral',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Clicks',
      value: totalClicks.toLocaleString(),
      change: avgCTR > 0 ? `${avgCTR.toFixed(2)}% avg CTR` : 'No clicks',
      trend: avgCTR > 1.5 ? 'positive' : avgCTR > 0 ? 'neutral' : 'negative',
      icon: MousePointer,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Conversions',
      value: totalConversions.toLocaleString(),
      change: avgROAS > 0 ? `${avgROAS.toFixed(1)}x avg ROAS` : 'No conversions',
      trend: avgROAS > 3 ? 'positive' : avgROAS > 0 ? 'neutral' : 'negative',
      icon: Target,
      color: 'bg-orange-500'
    }
  ];

  const platforms = ['all', 'Google Ads', 'Facebook Ads', 'LinkedIn Ads'];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
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
          <h1 className="text-2xl font-bold text-gray-900">Marketing Analysis</h1>
          <p className="text-gray-600">Campaign performance and traffic insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : platform}
              </option>
            ))}
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadMarketingData}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </motion.button>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aggregateMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center text-white`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                metric.trend === 'positive' 
                  ? 'text-green-700 bg-green-100' 
                  : metric.trend === 'negative'
                  ? 'text-red-700 bg-red-100'
                  : 'text-gray-700 bg-gray-100'
              }`}>
                {metric.change}
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600">
                {metric.title}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Campaign Table and Address Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Performance Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Campaign Performance</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {filteredCampaigns.length} Campaigns
            </div>
          </div>
          
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Marketing Campaigns</h3>
              <p className="text-gray-500 mb-4">Start tracking your marketing campaigns to see performance analytics here.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Connect Marketing Platforms
              </motion.button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Campaign</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Spend</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Clicks</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Conv.</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign, index) => (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{campaign.name}</div>
                          <div className="text-xs text-gray-500">{campaign.platform}</div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-medium text-gray-900">€{campaign.spent.toLocaleString()}</td>
                      <td className="py-4 text-center font-medium text-gray-900">{campaign.clicks.toLocaleString()}</td>
                      <td className="py-4 text-center font-medium text-gray-900">{campaign.conversions}</td>
                      <td className="py-4 text-right">
                        <span className={`font-medium ${campaign.roas >= 3 ? 'text-green-700' : campaign.roas >= 2 ? 'text-yellow-700' : 'text-red-700'}`}>
                          {campaign.roas.toFixed(1)}x
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Top Performing Addresses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Converting Locations</h3>
          
          <div className="space-y-4">
            {topAddresses.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No location data available</p>
              </div>
            ) : (
              topAddresses.map((location, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {location.address}
                    </div>
                    <div className="text-xs text-gray-500">
                      {location.percentage.toFixed(1)}% of total leads
                    </div>
                  </div>
                  <div className="ml-3 text-sm font-bold text-gray-900">
                    {location.count}
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          {topAddresses.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors flex items-center justify-center gap-1"
            >
              View Full Report <ExternalLink className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MarketingAnalytics;