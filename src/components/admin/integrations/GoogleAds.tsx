'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GoogleAdsAccount {
  id: string;
  name: string;
  currency: string;
  status: 'active' | 'paused' | 'suspended';
  spend_last_30_days: number;
  conversions_last_30_days: number;
  connected: boolean;
}

interface ConversionAction {
  id: string;
  name: string;
  type: 'lead' | 'purchase' | 'signup' | 'call';
  value: number;
  count_last_30_days: number;
  status: 'active' | 'paused';
}

const GoogleAds = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'conversions' | 'automation'>('overview');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [conversions, setConversions] = useState<ConversionAction[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    loadGoogleAdsData();
  }, []);

  const loadGoogleAdsData = async () => {
    setIsLoading(true);
    
    try {
      const [overviewRes, accountsRes, conversionsRes, configRes] = await Promise.all([
        fetch('/api/integrations/google-ads?type=overview'),
        fetch('/api/integrations/google-ads?type=accounts'),
        fetch('/api/integrations/google-ads?type=conversions'),
        fetch('/api/integrations/google-ads?type=config')
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setMetrics(overviewData.metrics);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);
      }

      if (conversionsRes.ok) {
        const conversionsData = await conversionsRes.json();
        setConversions(conversionsData);
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
        setConnectionStatus(configData.connected ? 'connected' : 'disconnected');
      }
    } catch (error) {
      console.error('Error loading Google Ads data:', error);
      setAccounts([]);
      setConversions([]);
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConversionTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return '👤';
      case 'purchase': return '💰';
      case 'signup': return '📝';
      case 'call': return '📞';
      default: return '📊';
    }
  };

  const handleConnect = () => {
    setConnectionStatus('connecting');
    // In a real implementation, this would trigger OAuth flow
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  const saveConfiguration = async (configData: any) => {
    try {
      const response = await fetch('/api/integrations/google-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_config',
          ...configData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setConnectionStatus('connected');
        loadGoogleAdsData();
        return result;
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const testConnection = async (configData: any) => {
    try {
      const response = await fetch('/api/integrations/google-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connection',
          ...configData
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error testing connection:', error);
      return { success: false, error: 'Connection test failed' };
    }
  };

  const createConversion = async (conversionData: any) => {
    try {
      const response = await fetch('/api/integrations/google-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_conversion',
          ...conversionData
        }),
      });

      if (response.ok) {
        loadGoogleAdsData();
        return await response.json();
      }
    } catch (error) {
      console.error('Error creating conversion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading Google Ads data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
            {/* Google Ads Logo */}
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#4285F4"/>
              <path d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2zM8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h5v2H8v-2z" fill="white"/>
              <path d="M16 14l-3-3v6l3-3z" fill="#4285F4"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Ads Integration</h1>
            <p className="text-gray-600">Manage conversions and automate bidding with Google Ads</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {connectionStatus === 'connecting' ? '🔄 Connecting...' : '🔗 Connect Google Ads'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'setup', name: 'Setup', icon: '⚙️' },
          { id: 'conversions', name: 'Conversions', icon: '🎯' },
          { id: 'automation', name: 'Automation', icon: '🤖' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {metrics ? [
              { title: 'Total Spend', value: `€${metrics.totalSpend?.toLocaleString() || '0'}`, change: metrics.changes?.spend || 'N/A', color: 'blue' },
              { title: 'Conversions', value: `${metrics.conversions || 0}`, change: metrics.changes?.conversions || 'N/A', color: 'green' },
              { title: 'Cost per Lead', value: `€${metrics.costPerLead?.toFixed(2) || '0.00'}`, change: metrics.changes?.costPerLead || 'N/A', color: 'purple' },
              { title: 'ROAS', value: `${metrics.roas?.toFixed(1) || '0.0'}x`, change: metrics.changes?.roas || 'N/A', color: 'yellow' }
            ] : [
              { title: 'Total Spend', value: '€0', change: 'No data', color: 'blue' },
              { title: 'Conversions', value: '0', change: 'No data', color: 'green' },
              { title: 'Cost per Lead', value: '€0.00', change: 'No data', color: 'purple' },
              { title: 'ROAS', value: '0.0x', change: 'No data', color: 'yellow' }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className={`w-12 h-12 bg-${metric.color}-500 rounded-lg flex items-center justify-center mb-4`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{metric.title}</div>
                <div className="text-xs text-gray-500">{metric.change}</div>
              </motion.div>
            ))}
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Connected Google Ads Accounts</h3>
            
            <div className="space-y-4">
              {accounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{account.name}</h4>
                      <p className="text-sm text-gray-600">ID: {account.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">€{account.spend_last_30_days.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">30-day spend</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{account.conversions_last_30_days}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">API Configuration</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
                  <input 
                    name="customerId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="123-456-7890"
                    defaultValue={config?.customerId || ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Google Ads Customer ID (without dashes)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Developer Token</label>
                  <input 
                    name="developerToken"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="••••••••••••••••"
                    defaultValue={config?.developerToken || ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Google Ads API developer token</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                  <input 
                    name="clientId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="OAuth 2.0 Client ID"
                    defaultValue={config?.clientId || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                  <input 
                    name="clientSecret"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="••••••••••••••••"
                    defaultValue={config?.clientSecret || ''}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Token</label>
                <textarea
                  name="refreshToken"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Your OAuth 2.0 refresh token"
                  defaultValue={config?.refreshToken || ''}
                />
                <p className="text-xs text-gray-500 mt-1">Generated during OAuth flow - used for API authentication</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Test connection with form data
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) {
                      const formData = new FormData(form);
                      testConnection({
                        customerId: formData.get('customerId'),
                        developerToken: formData.get('developerToken')
                      });
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Connection
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Save configuration with form data
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) {
                      const formData = new FormData(form);
                      saveConfiguration({
                        customerId: formData.get('customerId'),
                        developerToken: formData.get('developerToken'),
                        clientId: formData.get('clientId'),
                        clientSecret: formData.get('clientSecret'),
                        refreshToken: formData.get('refreshToken')
                      });
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Configuration
                </motion.button>
                
                <div className="text-sm text-gray-600">
                  {connectionStatus === 'connected' ? '✅ Connected successfully' : 
                   connectionStatus === 'connecting' ? '🔄 Connecting...' : 
                   '❌ Not connected'}
                </div>
              </div>
            </form>
          </div>

          {/* Server-Side Tracking Setup */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Server-Side Conversion Tracking</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-green-800">Enhanced Conversions Enabled</div>
                    <div className="text-sm text-green-600">First-party data being sent to improve conversion tracking</div>
                  </div>
                </div>
                <span className="text-green-700 font-medium">Active</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Offline Conversion Import</div>
                    <div className="text-sm text-blue-600">Automatically import offline sales data</div>
                  </div>
                </div>
                <span className="text-blue-700 font-medium">Configured</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Conversions Tab */}
      {activeTab === 'conversions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Conversion Actions</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Create a sample conversion action
                createConversion({
                  name: 'New Lead Conversion',
                  type: 'lead',
                  value: 50
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Conversion Action
            </motion.button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Conversion Action</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Type</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Value</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">30-Day Count</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Status</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {conversions.map((conversion, index) => (
                    <motion.tr
                      key={conversion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getConversionTypeIcon(conversion.type)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{conversion.name}</div>
                            <div className="text-sm text-gray-500">ID: {conversion.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {conversion.type}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center font-medium text-gray-900">
                        €{conversion.value}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-bold text-green-600">{conversion.count_last_30_days}</div>
                        <div className="text-xs text-gray-500">conversions</div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conversion.status)}`}>
                          {conversion.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smart Bidding */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Smart Bidding Automation</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Target CPA Bidding</span>
                  </div>
                  <span className="text-green-700 font-medium">€45</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">Target ROAS</span>
                  </div>
                  <span className="text-blue-700 font-medium">400%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-purple-800">Maximize Conversions</span>
                  </div>
                  <span className="text-purple-700 font-medium">Active</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configure Bidding Strategy
              </motion.button>
            </div>

            {/* Automated Rules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Automated Rules</h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Pause low-performing keywords', condition: 'CTR < 1% for 7 days', status: 'active' },
                  { name: 'Increase bids for high converters', condition: 'Conv. Rate > 5%', status: 'active' },
                  { name: 'Alert on budget pacing', condition: 'Budget spent > 80%', status: 'active' }
                ].map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500">{rule.condition}</div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {rule.status}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
              >
                + Add New Rule
              </motion.button>
            </div>
          </div>

          {/* Performance Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">AI Performance Recommendations</h3>
            
            <div className="space-y-4">
              {[
                {
                  type: 'optimization',
                  title: 'Increase Budget for Life Insurance Campaign',
                  description: 'This campaign is limited by budget and could generate 23% more conversions with increased spend.',
                  impact: '+23% conversions',
                  confidence: 'High',
                  action: 'Increase Budget'
                },
                {
                  type: 'keyword',
                  title: 'Add Negative Keywords',
                  description: 'Adding "free" and "DIY" as negative keywords could improve your conversion rate by 8%.',
                  impact: '+8% conv. rate',
                  confidence: 'Medium',
                  action: 'Add Keywords'
                },
                {
                  type: 'bidding',
                  title: 'Switch to Target CPA Bidding',
                  description: 'Based on your conversion history, Target CPA could reduce your cost per lead by 15%.',
                  impact: '-15% cost/lead',
                  confidence: 'High',
                  action: 'Change Bidding'
                }
              ].map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    {/* Google Ads Logo */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 11.8 11.2 14 14 14V22H18V14C20.8 14 23 11.8 23 9H21ZM12 8C13.1 8 14 8.9 14 10S13.1 12 12 12S10 11.1 10 10S10.9 8 12 8Z" fill="#4285F4"/>
                      <path d="M12 14C9.2 14 7 11.8 7 9V7L1 1L7 7V9C7 12.9 10.1 16 14 16H22V12H14C13.4 12 12.7 11.8 12 11.5V14Z" fill="#34A853"/>
                      <path d="M12 14V16C15.9 16 19 12.9 19 9H17C17 11.8 14.8 14 12 14Z" fill="#FBBC05"/>
                      <path d="M12 14C9.2 14 7 11.8 7 9H5C5 12.9 8.1 16 12 16V14Z" fill="#EA4335"/>
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">{rec.impact}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.confidence === 'High' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {rec.confidence}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        {rec.action}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Dismiss
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GoogleAds;