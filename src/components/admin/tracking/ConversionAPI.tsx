'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Database, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Globe,
  Key,
  Activity,
  Target,
  Users,
  Plus
} from 'lucide-react';

interface ConversionEndpoint {
  id: string;
  name: string;
  platform: string;
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'error';
  lastUsed: string | null;
  avgResponseTime: number | null;
  events: string[];
  authentication: 'api_key' | 'oauth' | 'webhook';
}

interface ConversionEvent {
  id: string;
  eventName: string;
  platform: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  value: number | null;
  currency: string;
  responseTime: number | null;
  errorMessage?: string;
}

interface APIConfiguration {
  platform: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookSecret?: string;
  testMode: boolean;
  isActive: boolean;
}

const ConversionAPI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [endpoints, setEndpoints] = useState<ConversionEndpoint[]>([]);
  const [recentEvents, setRecentEvents] = useState<ConversionEvent[]>([]);
  const [configurations, setConfigurations] = useState<APIConfiguration[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingMode, setTestingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversionData();
  }, []);

  const loadConversionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load conversion endpoints
      const endpointsResponse = await fetch('/api/tracking/conversion-api');
      if (!endpointsResponse.ok) {
        throw new Error('Failed to load conversion endpoints');
      }
      const endpointsData = await endpointsResponse.json();
      setEndpoints(endpointsData.endpoints || []);

      // Load recent conversion events
      const eventsResponse = await fetch('/api/tracking/conversion-api/events?limit=10');
      if (!eventsResponse.ok) {
        throw new Error('Failed to load conversion events');
      }
      const eventsData = await eventsResponse.json();
      setRecentEvents(eventsData.events || []);

      // Load API configurations
      const configResponse = await fetch('/api/tracking/api-keys');
      if (!configResponse.ok) {
        throw new Error('Failed to load API configurations');
      }
      const configData = await configResponse.json();
      setConfigurations(configData.configurations || []);

      if (configData.configurations && configData.configurations.length > 0) {
        setSelectedPlatform(configData.configurations[0].platform);
      }
    } catch (err) {
      console.error('Error loading conversion data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const testEndpoint = async (endpointId: string) => {
    try {
      const response = await fetch(`/api/tracking/conversion-api/${endpointId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testMode: true })
      });

      if (!response.ok) {
        throw new Error('Test failed');
      }

      // Reload data to see updated status
      loadConversionData();
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  const createEndpoint = async (endpointData: Partial<ConversionEndpoint>) => {
    try {
      const response = await fetch('/api/tracking/conversion-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpointData)
      });

      if (!response.ok) {
        throw new Error('Failed to create endpoint');
      }

      loadConversionData();
    } catch (err) {
      console.error('Failed to create endpoint:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const activeEndpoints = endpoints.filter(e => e.status === 'active').length;
  const totalConversions = recentEvents.length; // Count of recent events as total conversions
  const avgSuccessRate = recentEvents.length > 0 
    ? (recentEvents.filter(e => e.status === 'success').length / recentEvents.length) * 100 
    : 0;
  const recentSuccessCount = recentEvents.filter(e => e.status === 'success').length;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading conversion API...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadConversionData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversion API</h1>
          <p className="text-gray-600 mt-1">Manage server-side conversion tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTestingMode(!testingMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              testingMode 
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Test Mode
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Plus className="w-4 h-4" />
            Add Endpoint
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeEndpoints}</p>
              <p className="text-sm text-gray-600">Active Endpoints</p>
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
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
              <p className="text-sm text-gray-600">Recent Events</p>
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
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
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
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{recentSuccessCount}</p>
              <p className="text-sm text-gray-600">Recent Success</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h2>
        
        {endpoints.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Endpoints Configured</h3>
            <p className="text-gray-600 mb-4">Add your first conversion API endpoint to start tracking.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Endpoint
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <motion.div
                key={endpoint.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{endpoint.name}</h3>
                      <p className="text-sm text-gray-600">{endpoint.platform}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(endpoint.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                      {endpoint.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Method:</span>
                    <span className="ml-2 font-medium text-gray-900">{endpoint.method}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Auth:</span>
                    <span className="ml-2 font-medium text-gray-900">{endpoint.authentication}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Last Used:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {endpoint.lastUsed ? new Date(endpoint.lastUsed).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {endpoint.events.map((event, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Configure
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => testEndpoint(endpoint.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Test
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadConversionData}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
        
        {recentEvents.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Events</h3>
            <p className="text-gray-600">Conversion events will appear here once they start firing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Event</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Platform</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Value</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Response Time</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{event.eventName}</div>
                      {event.errorMessage && (
                        <div className="text-xs text-red-600">{event.errorMessage}</div>
                      )}
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">{event.platform}</td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getStatusIcon(event.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm font-medium text-gray-900">
                      {event.value ? `${event.currency}${event.value.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">
                      {event.responseTime && event.responseTime > 0 ? `${event.responseTime}ms` : '-'}
                    </td>
                    <td className="py-3 text-center text-xs text-gray-600">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API Configuration */}
      {configurations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {configurations.map((config) => (
                  <option key={config.platform} value={config.platform}>
                    {config.platform}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSecrets ? 'Hide' : 'Show'}
              </motion.button>
            </div>
          </div>

          {configurations
            .filter(config => config.platform === selectedPlatform)
            .map((config) => (
              <div key={config.platform} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.clientId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={showSecrets ? config.clientId : '••••••••••••••••'}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                  
                  {config.clientSecret && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={showSecrets ? config.clientSecret : '••••••••••••••••'}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Test Mode: {config.testMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                    style={{ backgroundColor: '#146443', color: 'white' }}
                  >
                    <Settings className="w-4 h-4" />
                    Update Configuration
                  </motion.button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ConversionAPI;