'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Shield,
  ExternalLink,
  Copy
} from 'lucide-react';

interface APIConfig {
  id: string;
  platform: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  webhookSecret: string;
  additionalSettings: Record<string, any>;
  testMode: boolean;
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
}

const APIKeyManager = () => {
  const [configs, setConfigs] = useState<APIConfig[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const platforms = [
    { id: 'Google Analytics', name: 'Google Analytics 4', icon: '📊', fields: ['clientId', 'clientSecret', 'accessToken', 'refreshToken', 'viewId'] },
    { id: 'Google Ads', name: 'Google Ads', icon: '🎯', fields: ['clientId', 'clientSecret', 'accessToken', 'refreshToken', 'developerToken', 'customerId'] },
    { id: 'Facebook', name: 'Facebook Pixel', icon: '👥', fields: ['accessToken', 'pixelId', 'appId', 'appSecret'] },
    { id: 'TikTok', name: 'TikTok Ads', icon: '🎵', fields: ['accessToken', 'appId', 'secret', 'pixelCode'] },
    { id: 'Salesforce', name: 'Salesforce CRM', icon: '☁️', fields: ['clientId', 'clientSecret', 'accessToken', 'refreshToken', 'instanceUrl'] },
    { id: 'Mailchimp', name: 'Mailchimp', icon: '📧', fields: ['apiKey', 'serverPrefix'] },
    { id: 'Zapier', name: 'Zapier', icon: '⚡', fields: ['webhookUrl', 'apiKey'] }
  ];

  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tracking/api-keys');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configurations);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedPlatform) {
      alert('Please select a platform');
      return;
    }

    const platform = platforms.find(p => p.id === selectedPlatform);
    if (!platform) return;

    setIsSaving(true);
    try {
      const configData = {
        platform: selectedPlatform,
        ...formData,
        testConnection: true
      };

      const response = await fetch('/api/tracking/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data.testConnection) {
          setTestResults(prev => ({
            ...prev,
            [selectedPlatform]: result.data.testConnection
          }));
        }
        
        loadConfigurations();
        setFormData({});
        alert('Configuration saved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (platform: string) => {
    try {
      const config = configs.find(c => c.platform === platform);
      if (!config) return;

      const response = await fetch('/api/tracking/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          action: 'test'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(prev => ({
          ...prev,
          [platform]: result.data.testResult
        }));
        
        // Update the config status
        setConfigs(prev => prev.map(c => 
          c.platform === platform 
            ? { ...c, isActive: result.data.isActive }
            : c
        ));
      }
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  const handleRefreshToken = async (platform: string) => {
    try {
      const config = configs.find(c => c.platform === platform);
      if (!config) return;

      const response = await fetch('/api/tracking/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          action: 'refresh_token'
        })
      });

      if (response.ok) {
        const result = await response.json();
        loadConfigurations(); // Reload to get updated token
        alert(result.message);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  const toggleSecretVisibility = (platform: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading API configurations...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">API Key Manager</h1>
          <p className="text-gray-600 mt-1">Manage API credentials for platform integrations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadConfigurations}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Security Notice</p>
            <p>All API keys and secrets are encrypted before storage. Test connections are performed securely and credentials are never logged or transmitted in plain text.</p>
          </div>
        </div>
      </div>

      {/* Current Configurations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Configurations</h2>
        
        {configs.length > 0 ? (
          <div className="space-y-4">
            {configs.map((config) => {
              const platform = platforms.find(p => p.id === config.platform);
              const testResult = testResults[config.platform];
              
              return (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform?.icon || '🔧'}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{config.platform}</h3>
                        <p className="text-sm text-gray-600">
                          Last used: {config.lastUsed ? new Date(config.lastUsed).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(config.isActive)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(config.isActive)}`}>
                          {config.isActive ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTestConnection(config.platform)}
                          className="p-2 text-blue-600 hover:text-blue-700"
                          title="Test Connection"
                        >
                          <TestTube className="w-4 h-4" />
                        </motion.button>
                        
                        {config.refreshToken && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRefreshToken(config.platform)}
                            className="p-2 text-green-600 hover:text-green-700"
                            title="Refresh Token"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSecretVisibility(config.platform)}
                          className="p-2 text-gray-600 hover:text-gray-700"
                          title={showSecrets[config.platform] ? 'Hide Secrets' : 'Show Secrets'}
                        >
                          {showSecrets[config.platform] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {config.clientId && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Client ID:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-gray-900">
                            {showSecrets[config.platform] ? config.clientId : config.clientId.substring(0, 8) + '...'}
                          </span>
                          <button onClick={() => copyToClipboard(config.clientId)}>
                            <Copy className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {config.accessToken && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Access Token:</span>
                        <span className="font-mono text-gray-900">••••••••••••••••</span>
                      </div>
                    )}
                  </div>

                  {/* Test Results */}
                  {testResult && (
                    <div className={`mt-3 p-3 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-2">
                        {testResult.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                          Connection Test: {testResult.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      {testResult.error && (
                        <p className="text-red-700 text-sm mt-1">{testResult.error}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API Configurations</h3>
            <p className="text-gray-600">Add your first platform integration below.</p>
          </div>
        )}
      </div>

      {/* Add New Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Platform Integration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a platform...</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.icon} {platform.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPlatform && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms
                  .find(p => p.id === selectedPlatform)
                  ?.fields.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        {field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? (
                          <span className="text-red-500 ml-1">*</span>
                        ) : null}
                      </label>
                      <input
                        type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                        value={formData[field] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={getFieldPlaceholder(field)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveConfiguration}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save & Test Connection'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPlatform('');
                    setFormData({});
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>

              {/* Platform-specific help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Setup Instructions for {selectedPlatform}</p>
                    <p>{getPlatformInstructions(selectedPlatform)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

function getFieldPlaceholder(field: string): string {
  const placeholders: Record<string, string> = {
    clientId: 'Your client ID from the platform',
    clientSecret: 'Your client secret (keep secure)',
    accessToken: 'Access token for API calls',
    refreshToken: 'Refresh token for automatic renewal',
    apiKey: 'Your API key',
    pixelId: 'Facebook Pixel ID',
    appId: 'Application ID',
    appSecret: 'Application secret',
    instanceUrl: 'https://yourcompany.salesforce.com',
    viewId: 'GA4 Property ID',
    developerToken: 'Google Ads developer token',
    customerId: 'Google Ads customer ID',
    serverPrefix: 'Mailchimp server prefix (e.g., us1)',
    webhookUrl: 'Webhook endpoint URL',
    pixelCode: 'TikTok pixel code'
  };
  
  return placeholders[field] || `Enter your ${field}`;
}

function getPlatformInstructions(platform: string): string {
  const instructions: Record<string, string> = {
    'Google Analytics': 'Create a service account in Google Cloud Console, enable Analytics Reporting API, and download the credentials.',
    'Google Ads': 'Apply for Google Ads API access, create OAuth2 credentials, and obtain a developer token.',
    'Facebook': 'Create a Facebook App, add the Conversions API product, and generate an access token.',
    'TikTok': 'Register for TikTok Business API, create an app, and obtain API credentials.',
    'Salesforce': 'Create a Connected App in Salesforce Setup, configure OAuth settings, and generate tokens.',
    'Mailchimp': 'Generate an API key from your Mailchimp account settings under Extras > API keys.',
    'Zapier': 'Create a webhook in Zapier and copy the webhook URL provided.'
  };
  
  return instructions[platform] || 'Check the platform documentation for setup instructions.';
}

export default APIKeyManager;