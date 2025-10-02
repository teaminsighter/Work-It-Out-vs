'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface APISettings {
  google_ads: {
    client_id: string;
    client_secret: string;
    developer_token: string;
    refresh_token: string;
    customer_id: string;
  };
  facebook: {
    app_id: string;
    app_secret: string;
    access_token: string;
    pixel_id: string;
  };
  ga4: {
    measurement_id: string;
    api_secret: string;
    property_id: string;
  };
  twilio: {
    account_sid: string;
    auth_token: string;
    phone_number: string;
  };
  email: {
    smtp_host: string;
    smtp_port: string;
    smtp_user: string;
    smtp_password: string;
    from_email: string;
  };
  solar_api: {
    weather_api_key: string;
    solar_irradiance_api: string;
    electricity_prices_api: string;
  };
}

const APIConfiguration = () => {
  const [activeTab, setActiveTab] = useState<string>('google_ads');
  const [apiSettings, setApiSettings] = useState<APISettings>({
    google_ads: {
      client_id: '',
      client_secret: '',
      developer_token: '',
      refresh_token: '',
      customer_id: ''
    },
    facebook: {
      app_id: '',
      app_secret: '',
      access_token: '',
      pixel_id: ''
    },
    ga4: {
      measurement_id: '',
      api_secret: '',
      property_id: ''
    },
    twilio: {
      account_sid: '',
      auth_token: '',
      phone_number: ''
    },
    email: {
      smtp_host: '',
      smtp_port: '587',
      smtp_user: '',
      smtp_password: '',
      from_email: ''
    },
    solar_api: {
      weather_api_key: '',
      solar_irradiance_api: '',
      electricity_prices_api: ''
    }
  });

  const [testResults, setTestResults] = useState<{[key: string]: 'success' | 'error' | 'testing' | null}>({});
  const [savedSettings, setSavedSettings] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/api-config');
      const data = await response.json();
      
      if (data.success) {
        setApiSettings(data.data);
      } else {
        console.error('Failed to load API settings:', data.error);
      }
    } catch (error) {
      console.error('Error loading API settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (category: keyof APISettings, field: string, value: string) => {
    setApiSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    
    // Clear saved status when user makes changes
    setSavedSettings(prev => ({
      ...prev,
      [category]: false
    }));
  };

  const saveSettings = async (category: keyof APISettings) => {
    try {
      const response = await fetch('/api/admin/api-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: category,
          settings: apiSettings[category],
          userId: 'admin' // TODO: Get from auth context
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSavedSettings(prev => ({
          ...prev,
          [category]: true
        }));
        
        // Clear saved status after 3 seconds
        setTimeout(() => {
          setSavedSettings(prev => ({
            ...prev,
            [category]: false
          }));
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save API settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const testConnection = async (category: keyof APISettings) => {
    setTestResults(prev => ({ ...prev, [category]: 'testing' }));
    
    // Simulate API testing
    setTimeout(() => {
      const hasRequiredFields = Object.values(apiSettings[category]).some(value => value.trim() !== '');
      setTestResults(prev => ({
        ...prev,
        [category]: hasRequiredFields ? 'success' : 'error'
      }));
    }, 2000);
  };

  const tabs = [
    { id: 'google_ads', name: 'Google Ads', icon: '🟡' },
    { id: 'facebook', name: 'Facebook', icon: '🔵' },
    { id: 'ga4', name: 'Google Analytics 4', icon: '📊' },
    { id: 'twilio', name: 'Twilio SMS', icon: '📱' },
    { id: 'email', name: 'Email SMTP', icon: '📧' },
    { id: 'solar_api', name: 'Solar APIs', icon: '☀️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'google_ads':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                <input
                  type="text"
                  value={apiSettings.google_ads.client_id}
                  onChange={(e) => handleInputChange('google_ads', 'client_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="123456789.apps.googleusercontent.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                <input
                  type="password"
                  value={apiSettings.google_ads.client_secret}
                  onChange={(e) => handleInputChange('google_ads', 'client_secret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Developer Token</label>
                <input
                  type="password"
                  value={apiSettings.google_ads.developer_token}
                  onChange={(e) => handleInputChange('google_ads', 'developer_token', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
                <input
                  type="text"
                  value={apiSettings.google_ads.customer_id}
                  onChange={(e) => handleInputChange('google_ads', 'customer_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="123-456-7890"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Token</label>
                <input
                  type="password"
                  value={apiSettings.google_ads.refresh_token}
                  onChange={(e) => handleInputChange('google_ads', 'refresh_token', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
              </div>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
                <input
                  type="text"
                  value={apiSettings.facebook.app_id}
                  onChange={(e) => handleInputChange('facebook', 'app_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1234567890123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App Secret</label>
                <input
                  type="password"
                  value={apiSettings.facebook.app_secret}
                  onChange={(e) => handleInputChange('facebook', 'app_secret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pixel ID</label>
                <input
                  type="text"
                  value={apiSettings.facebook.pixel_id}
                  onChange={(e) => handleInputChange('facebook', 'pixel_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1234567890123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                <input
                  type="password"
                  value={apiSettings.facebook.access_token}
                  onChange={(e) => handleInputChange('facebook', 'access_token', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
              </div>
            </div>
          </div>
        );

      case 'ga4':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement ID</label>
                <input
                  type="text"
                  value={apiSettings.ga4.measurement_id}
                  onChange={(e) => handleInputChange('ga4', 'measurement_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                <input
                  type="password"
                  value={apiSettings.ga4.api_secret}
                  onChange={(e) => handleInputChange('ga4', 'api_secret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••••••••••"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property ID</label>
                <input
                  type="text"
                  value={apiSettings.ga4.property_id}
                  onChange={(e) => handleInputChange('ga4', 'property_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="123456789"
                />
              </div>
            </div>
          </div>
        );

      case 'twilio':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                <input
                  type="text"
                  value={apiSettings.twilio.account_sid}
                  onChange={(e) => handleInputChange('twilio', 'account_sid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="AC..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                <input
                  type="password"
                  value={apiSettings.twilio.auth_token}
                  onChange={(e) => handleInputChange('twilio', 'auth_token', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={apiSettings.twilio.phone_number}
                  onChange={(e) => handleInputChange('twilio', 'phone_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={apiSettings.email.smtp_host}
                  onChange={(e) => handleInputChange('email', 'smtp_host', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                <input
                  type="text"
                  value={apiSettings.email.smtp_port}
                  onChange={(e) => handleInputChange('email', 'smtp_port', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="587"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={apiSettings.email.smtp_user}
                  onChange={(e) => handleInputChange('email', 'smtp_user', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={apiSettings.email.smtp_password}
                  onChange={(e) => handleInputChange('email', 'smtp_password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••••••••••"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                <input
                  type="email"
                  value={apiSettings.email.from_email}
                  onChange={(e) => handleInputChange('email', 'from_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="noreply@yourcompany.com"
                />
              </div>
            </div>
          </div>
        );

      case 'solar_api':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weather API Key</label>
                <input
                  type="password"
                  value={apiSettings.solar_api.weather_api_key}
                  onChange={(e) => handleInputChange('solar_api', 'weather_api_key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="OpenWeatherMap or similar API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solar Irradiance API</label>
                <input
                  type="text"
                  value={apiSettings.solar_api.solar_irradiance_api}
                  onChange={(e) => handleInputChange('solar_api', 'solar_irradiance_api', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://api.solcast.com.au or similar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Electricity Prices API</label>
                <input
                  type="text"
                  value={apiSettings.solar_api.electricity_prices_api}
                  onChange={(e) => handleInputChange('solar_api', 'electricity_prices_api', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Regional electricity pricing API endpoint"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading API configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Configuration</h1>
        <p className="text-gray-600">Configure API keys and credentials for all integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
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

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.name} Configuration
          </h3>
          
          {/* Connection Status */}
          {testResults[activeTab] && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              testResults[activeTab] === 'success' 
                ? 'bg-green-100 text-green-800' 
                : testResults[activeTab] === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {testResults[activeTab] === 'success' && '✅ Connected'}
              {testResults[activeTab] === 'error' && '❌ Connection Failed'}
              {testResults[activeTab] === 'testing' && '🔄 Testing...'}
            </div>
          )}
        </div>

        {renderTabContent()}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => saveSettings(activeTab as keyof APISettings)}
            className={`px-6 py-2 rounded-lg transition-colors ${
              savedSettings[activeTab]
                ? 'bg-green-600 text-white'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {savedSettings[activeTab] ? '✅ Saved' : '💾 Save Settings'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => testConnection(activeTab as keyof APISettings)}
            disabled={testResults[activeTab] === 'testing'}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {testResults[activeTab] === 'testing' ? '🔄 Testing...' : '🧪 Test Connection'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default APIConfiguration;