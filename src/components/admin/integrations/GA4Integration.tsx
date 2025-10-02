'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GA4Integration = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'events' | 'ecommerce'>('overview');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for real data
  const [overview, setOverview] = useState({
    totalUsers: 0,
    sessions: 0,
    conversions: 0,
    revenue: 0,
    changeUsers: 0,
    changeSessions: 0,
    changeConversions: 0,
    changeRevenue: 0
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [ecommerce, setEcommerce] = useState({
    purchaseEvents: 0,
    purchaseRevenue: 0,
    addToCartEvents: 0,
    addToCartConversionRate: 0,
    beginCheckoutEvents: 0,
    checkoutCompletionRate: 0
  });
  const [configuration, setConfiguration] = useState({
    measurementId: '',
    apiSecret: '',
    apiKey: ''
  });

  // Load GA4 data
  const loadGA4Data = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewRes, propertiesRes, eventsRes, ecommerceRes, configRes] = await Promise.all([
        fetch('/api/integrations/ga4?type=overview'),
        fetch('/api/integrations/ga4?type=properties'),
        fetch('/api/integrations/ga4?type=events'),
        fetch('/api/integrations/ga4?type=ecommerce'),
        fetch('/api/integrations/ga4?type=config')
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setOverview(overviewData);
      }

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }

      if (ecommerceRes.ok) {
        const ecommerceData = await ecommerceRes.json();
        setEcommerce(ecommerceData);
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfiguration(configData);
        if (configData.measurementId && configData.isActive) {
          setConnectionStatus('connected');
        }
      }
    } catch (error) {
      console.error('Error loading GA4 data:', error);
      setError('Failed to load GA4 data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGA4Data();
  }, []);

  const handleConnect = async () => {
    setConnectionStatus('connecting');
    try {
      const response = await fetch('/api/integrations/ga4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'connect' })
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        await loadGA4Data();
      } else {
        setConnectionStatus('disconnected');
        setError('Failed to connect to GA4');
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
        measurementId: formData.get('measurementId') as string,
        apiSecret: formData.get('apiSecret') as string,
        apiKey: formData.get('apiKey') as string
      };

      const response = await fetch('/api/integrations/ga4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        await loadGA4Data();
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
      const response = await fetch('/api/integrations/ga4', {
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
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Analytics 4</h1>
            <p className="text-gray-600">Advanced measurement and server-side tracking</p>
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
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {connectionStatus === 'connecting' ? '🔄 Connecting...' : '🔗 Connect GA4'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'setup', name: 'Setup', icon: '⚙️' },
          { id: 'events', name: 'Events', icon: '🎯' },
          { id: 'ecommerce', name: 'E-commerce', icon: '💰' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
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
                title: 'Total Users', 
                value: isLoading ? '...' : overview.totalUsers.toLocaleString(), 
                change: isLoading ? '...' : `${overview.changeUsers > 0 ? '+' : ''}${overview.changeUsers.toFixed(1)}% vs last month`, 
                color: 'orange' 
              },
              { 
                title: 'Sessions', 
                value: isLoading ? '...' : overview.sessions.toLocaleString(), 
                change: isLoading ? '...' : `${overview.changeSessions > 0 ? '+' : ''}${overview.changeSessions.toFixed(1)}% increase`, 
                color: 'red' 
              },
              { 
                title: 'Conversions', 
                value: isLoading ? '...' : overview.conversions.toLocaleString(), 
                change: isLoading ? '...' : `${overview.changeConversions > 0 ? '+' : ''}${overview.changeConversions.toFixed(1)}% change`, 
                color: 'green' 
              },
              { 
                title: 'Revenue', 
                value: isLoading ? '...' : `$${overview.revenue.toLocaleString()}`, 
                change: isLoading ? '...' : `${overview.changeRevenue > 0 ? '+' : ''}${overview.changeRevenue.toFixed(1)}% vs last month`, 
                color: 'blue' 
              }
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

          {/* Connected Properties */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Connected GA4 Properties</h3>
            
            <div className="space-y-4">
              {properties.length === 0 && !isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  No GA4 properties connected. Configure your setup to get started.
                </div>
              ) : (
                properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                        GA4
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{property.name}</h4>
                        <p className="text-sm text-gray-600">Property ID: {property.propertyId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{property.users30d?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-500">Users (30d)</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-orange-600">{property.conversions?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-500">Conversions</div>
                      </div>
                      
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        property.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
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
            <h3 className="text-lg font-bold text-gray-900 mb-6">GA4 Configuration</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Measurement ID</label>
                  <input 
                    name="measurementId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="G-XXXXXXXXXX"
                    defaultValue={configuration.measurementId}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                  <input 
                    name="apiSecret"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="••••••••••••••••"
                    defaultValue={configuration.apiSecret}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key (Optional)</label>
                <input 
                  name="apiKey"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="••••••••••••••••"
                  defaultValue={configuration.apiKey}
                />
                <p className="text-xs text-gray-500 mt-1">Required for server-side events via Measurement Protocol</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Server-Side Tracking</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enable Measurement Protocol</label>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enhanced E-commerce</label>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Google Signals</label>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
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
            </div>
          </form>
        </motion.div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Custom Events</h3>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No custom events configured.</div>
            ) : (
              events.map((event, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div>
                    <div className="font-medium text-gray-900">{event.name}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-orange-600">{event.count?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-gray-500">30 days</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* E-commerce Tab */}
      {activeTab === 'ecommerce' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">E-commerce Tracking</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-2">Purchase Events</div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                {isLoading ? '...' : ecommerce.purchaseEvents.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">
                ${isLoading ? '...' : ecommerce.purchaseRevenue.toLocaleString()} revenue
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 mb-2">Add to Cart</div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {isLoading ? '...' : ecommerce.addToCartEvents.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">
                {isLoading ? '...' : ecommerce.addToCartConversionRate}% conversion rate
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-800 mb-2">Begin Checkout</div>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                {isLoading ? '...' : ecommerce.beginCheckoutEvents.toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">
                {isLoading ? '...' : ecommerce.checkoutCompletionRate}% completion
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GA4Integration;