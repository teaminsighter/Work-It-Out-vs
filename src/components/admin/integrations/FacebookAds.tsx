'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FacebookAdAccount {
  id: string;
  name: string;
  currency: string;
  status: 'active' | 'paused' | 'disabled';
  spend_last_30_days: number;
  results_last_30_days: number;
  connected: boolean;
}

interface PixelEvent {
  id: string;
  name: string;
  event_type: 'Lead' | 'Purchase' | 'CompleteRegistration' | 'Contact';
  server_side: boolean;
  browser_side: boolean;
  events_last_30_days: number;
  deduplication_rate: number;
}

const FacebookAds = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'pixel' | 'events'>('overview');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for real data
  const [accounts, setAccounts] = useState<FacebookAdAccount[]>([]);
  const [pixelEvents, setPixelEvents] = useState<PixelEvent[]>([]);
  const [overview, setOverview] = useState({
    totalSpend: 0,
    results: 0,
    costPerResult: 0,
    roas: 0,
    changeSpend: 0,
    changeResults: 0,
    changeCostPerResult: 0,
    changeRoas: 0
  });
  const [capiMetrics, setCapiMetrics] = useState({
    serverEvents: 0,
    matchQuality: 0,
    deduplicationRate: 0
  });
  const [configuration, setConfiguration] = useState({
    appId: '',
    appSecret: '',
    pixelId: '',
    accessToken: '',
    testEventCode: ''
  });

  // Load Facebook Ads data
  const loadFacebookAdsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewRes, accountsRes, eventsRes, capiRes, configRes] = await Promise.all([
        fetch('/api/integrations/facebook-ads?type=overview'),
        fetch('/api/integrations/facebook-ads?type=accounts'),
        fetch('/api/integrations/facebook-ads?type=events'),
        fetch('/api/integrations/facebook-ads?type=capi'),
        fetch('/api/integrations/facebook-ads?type=config')
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setOverview(overviewData);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setPixelEvents(eventsData);
      }

      if (capiRes.ok) {
        const capiData = await capiRes.json();
        setCapiMetrics(capiData);
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfiguration(configData);
        if (configData.appId && configData.accessToken) {
          setConnectionStatus('connected');
        }
      }
    } catch (error) {
      console.error('Error loading Facebook Ads data:', error);
      setError('Failed to load Facebook Ads data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacebookAdsData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'disabled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Lead': return '👤';
      case 'Purchase': return '💰';
      case 'CompleteRegistration': return '📝';
      case 'Contact': return '📞';
      default: return '📊';
    }
  };

  const handleConnect = async () => {
    setConnectionStatus('connecting');
    try {
      const response = await fetch('/api/integrations/facebook-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'connect' })
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        await loadFacebookAdsData();
      } else {
        setConnectionStatus('disconnected');
        setError('Failed to connect to Facebook Ads');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setError('Connection error');
    }
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const configData = {
        type: 'saveConfig',
        appId: formData.get('appId') as string,
        appSecret: formData.get('appSecret') as string,
        pixelId: formData.get('pixelId') as string,
        accessToken: formData.get('accessToken') as string,
        testEventCode: formData.get('testEventCode') as string
      };

      const response = await fetch('/api/integrations/facebook-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        await loadFacebookAdsData();
        setError(null);
      } else {
        setError('Failed to save configuration');
      }
    } catch (error) {
      setError('Error saving configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/facebook-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test' })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setError('✅ Connection test successful');
      } else {
        setError(result.message || 'Connection test failed');
      }
    } catch (error) {
      setError('Test connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facebook Ads Integration</h1>
            <p className="text-gray-600">Manage conversions with Conversion API and advanced tracking</p>
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
              {connectionStatus === 'connecting' ? '🔄 Connecting...' : '🔗 Connect Facebook'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'setup', name: 'Setup', icon: '⚙️' },
          { id: 'pixel', name: 'Pixel & CAPI', icon: '📡' },
          { id: 'events', name: 'Events', icon: '🎯' }
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
            {[
              { 
                title: 'Total Spend', 
                value: isLoading ? '...' : `$${overview.totalSpend.toLocaleString()}`, 
                change: isLoading ? '...' : `${overview.changeSpend > 0 ? '+' : ''}${overview.changeSpend.toFixed(1)}% vs last month`, 
                color: 'blue' 
              },
              { 
                title: 'Results', 
                value: isLoading ? '...' : overview.results.toString(), 
                change: isLoading ? '...' : `${overview.changeResults > 0 ? '+' : ''}${overview.changeResults.toFixed(1)}% increase`, 
                color: 'green' 
              },
              { 
                title: 'Cost per Result', 
                value: isLoading ? '...' : `$${overview.costPerResult.toFixed(2)}`, 
                change: isLoading ? '...' : `${overview.changeCostPerResult > 0 ? '+' : ''}${overview.changeCostPerResult.toFixed(1)}% change`, 
                color: 'purple' 
              },
              { 
                title: 'ROAS', 
                value: isLoading ? '...' : `${overview.roas.toFixed(1)}x`, 
                change: isLoading ? '...' : `${overview.changeRoas > 0 ? '+' : ''}${overview.changeRoas.toFixed(1)}x vs last month`, 
                color: 'yellow' 
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  metric.color === 'blue' ? 'bg-blue-500' :
                  metric.color === 'green' ? 'bg-green-500' :
                  metric.color === 'purple' ? 'bg-purple-500' :
                  metric.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value || '...'}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{metric.title || 'Loading...'}</div>
                <div className="text-xs text-gray-500">{metric.change || 'No data'}</div>
              </motion.div>
            ))}
          </div>

          {/* Connected Ad Accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Connected Facebook Ad Accounts</h3>
            
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
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold">
                      f
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{account.name}</h4>
                      <p className="text-sm text-gray-600">{account.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">${account.spend_last_30_days.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">30-day spend</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">{account.results_last_30_days}</div>
                      <div className="text-xs text-gray-500">Results</div>
                    </div>
                    
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Conversion API Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion API Health</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="font-medium text-green-800">Server Events</div>
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">{isLoading ? '...' : capiMetrics.serverEvents}</div>
                <div className="text-sm text-green-600">Last 30 days</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-medium text-blue-800">Match Quality</div>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">{isLoading ? '...' : `${capiMetrics.matchQuality.toFixed(1)}/10`}</div>
                <div className="text-sm text-blue-600">Average score</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="font-medium text-purple-800">Deduplication</div>
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">{isLoading ? '...' : `${capiMetrics.deduplicationRate.toFixed(1)}%`}</div>
                <div className="text-sm text-purple-600">Duplicate rate</div>
              </div>
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
          {error && (
            <div className={`p-4 rounded-lg border ${
              error.includes('✅') 
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSaveConfiguration} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">API Configuration</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
                  <input 
                    name="appId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Your Facebook App ID"
                    defaultValue={configuration.appId}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">App Secret</label>
                  <input 
                    name="appSecret"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="••••••••••••••••"
                    defaultValue={configuration.appSecret}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pixel ID</label>
                  <input 
                    name="pixelId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Your Facebook Pixel ID"
                    defaultValue={configuration.pixelId}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                  <input 
                    name="accessToken"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="••••••••••••••••"
                    defaultValue={configuration.accessToken}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Event Code</label>
                <input 
                  name="testEventCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="TEST12345"
                  defaultValue={configuration.testEventCode}
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Used for testing events in Test Events tool</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <motion.button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </motion.button>
                
                {connectionStatus === 'connected' && (
                  <div className="text-sm text-green-600">
                    ✅ Connected successfully
                  </div>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Pixel & CAPI Tab */}
      {activeTab === 'pixel' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Pixel Implementation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Facebook Pixel Implementation</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-green-800">Pixel Base Code</div>
                    <div className="text-sm text-green-600">Active on all pages</div>
                  </div>
                </div>
                <span className="text-green-700 font-medium">✅ Active</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Conversions API</div>
                    <div className="text-sm text-blue-600">Server-side events active</div>
                  </div>
                </div>
                <span className="text-blue-700 font-medium">🚀 Running</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-purple-800">Advanced Matching</div>
                    <div className="text-sm text-purple-600">Email, phone, and address matching</div>
                  </div>
                </div>
                <span className="text-purple-700 font-medium">⚡ Enhanced</span>
              </div>
            </div>
          </div>

          {/* Conversion API Setup */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion API Configuration</h3>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">📡 Server-Side Event Tracking</h4>
                <p className="text-sm text-blue-700">
                  Events are automatically sent from your server to Facebook's Conversion API, improving data accuracy and ad performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Source URL</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    defaultValue="https://your-domain.com"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partner Agent</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    defaultValue="work-it-out-v1.0"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enable Automatic Event Deduplication</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Send Customer Information (Advanced Matching)</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enable Test Event Logging</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          </div>

          {/* Event Code Examples */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Implementation Examples</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Server-Side Event (Node.js)</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
{`const bizSdk = require('facebook-nodejs-business-sdk');
const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;

const event = new ServerEvent()
  .setEventName('Lead')
  .setEventTime(Math.floor(Date.now() / 1000))
  .setUserData(userData)
  .setCustomData({
    currency: 'EUR',
    value: 75.00,
    content_name: 'Insurance Quote Lead'
  })
  .setEventSourceUrl('https://your-site.com/calculator')
  .setActionSource('website');

const eventRequest = new EventRequest()
  .setPixelId(PIXEL_ID)
  .setEvents([event]);

eventRequest.execute();`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Browser Event (JavaScript)</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-blue-400 text-sm font-mono">
{`fbq('track', 'Lead', {
  content_name: 'Insurance Quote',
  content_category: 'lead_generation',
  value: 75.00,
  currency: 'EUR',
  predicted_ltv: 2500.00
}, {
  eventID: 'unique_event_id_123'
});`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Pixel Events</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                alert("Create Custom Event\n\nThis would open a modal to:\n• Choose event type\n• Configure event parameters\n• Set up tracking rules\n• Enable server-side/browser-side tracking");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Custom Event
            </motion.button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Event</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Type</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Tracking</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">30-Day Events</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Dedup Rate</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pixelEvents.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getEventTypeIcon(event.event_type)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{event.name}</div>
                            <div className="text-sm text-gray-500">{event.event_type}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {event.event_type}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {event.browser_side && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Browser</span>
                          )}
                          {event.server_side && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Server</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-bold text-blue-600">{event.events_last_30_days}</div>
                        <div className="text-xs text-gray-500">events</div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-gray-900">{event.deduplication_rate}%</div>
                        <div className="text-xs text-gray-500">duplicates</div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              alert(`Testing event: ${event.name}\nType: ${event.event_type}\nServer-side: ${event.server_side ? 'Yes' : 'No'}\nBrowser-side: ${event.browser_side ? 'Yes' : 'No'}\nSending test event to Facebook Pixel...`);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Test Event"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              alert(`Event Details:\n\nName: ${event.name}\nID: ${event.id}\nType: ${event.event_type}\nServer-side tracking: ${event.server_side ? 'Enabled' : 'Disabled'}\nBrowser-side tracking: ${event.browser_side ? 'Enabled' : 'Disabled'}\nEvents (30 days): ${event.events_last_30_days}\nDeduplication rate: ${event.deduplication_rate}%`);
                            }}
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

          {/* Event Quality Score */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Event Quality & Recommendations</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Event Match Quality: {isLoading ? 'Loading...' : 
                      capiMetrics.matchQuality >= 8 ? 'Excellent' :
                      capiMetrics.matchQuality >= 6 ? 'Good' : 'Needs Improvement'
                    } ({isLoading ? '...' : `${capiMetrics.matchQuality.toFixed(1)}/10`})
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {isLoading ? 'Analyzing event quality...' :
                      capiMetrics.matchQuality >= 7 
                        ? 'Your events contain sufficient customer information for effective ad optimization.'
                        : 'Your events could benefit from additional customer information for better optimization.'}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${capiMetrics.matchQuality * 10}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">Recommendation: Improve Match Rate</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {isLoading ? 'Loading recommendations...' : 
                      capiMetrics.matchQuality < 7 
                        ? 'Consider collecting additional customer data (phone numbers, addresses) to improve ad targeting and attribution.'
                        : 'Your match quality is good. Consider implementing advanced matching for even better results.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FacebookAds;