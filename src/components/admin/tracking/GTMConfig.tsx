'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Code, 
  Globe, 
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw,
  Database,
  Shield,
  Monitor,
  Activity,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';

interface GTMContainer {
  id: string;
  name: string;
  containerId: string;
  accountId: string;
  status: 'active' | 'inactive' | 'draft';
  version: number;
  lastPublished: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GTMTag {
  id: string;
  containerId: string;
  name: string;
  type: string;
  status: 'active' | 'paused';
  triggers: string[];
  configuration: Record<string, any>;
  firingCount: number;
  createdAt: string;
  updatedAt: string;
}

interface GTMTrigger {
  id: string;
  containerId: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface GTMVariable {
  id: string;
  containerId: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const GTMConfig = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [containers, setContainers] = useState<GTMContainer[]>([]);
  const [tags, setTags] = useState<GTMTag[]>([]);
  const [triggers, setTriggers] = useState<GTMTrigger[]>([]);
  const [variables, setVariables] = useState<GTMVariable[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [gtmCode, setGtmCode] = useState<string>('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGTMData();
  }, []);

  useEffect(() => {
    if (selectedContainer) {
      loadContainerDetails(selectedContainer);
    }
  }, [selectedContainer]);

  const loadGTMData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tracking/gtm-config');
      if (!response.ok) {
        throw new Error('Failed to load GTM configuration');
      }
      
      const data = await response.json();
      setContainers(data.containers || []);
      
      if (data.containers && data.containers.length > 0) {
        setSelectedContainer(data.containers[0].id);
      }
    } catch (err) {
      console.error('Error loading GTM data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadContainerDetails = async (containerId: string) => {
    try {
      // Load tags
      const tagsResponse = await fetch(`/api/tracking/gtm-config/${containerId}/tags`);
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setTags(tagsData.tags || []);
      }

      // Load triggers
      const triggersResponse = await fetch(`/api/tracking/gtm-config/${containerId}/triggers`);
      if (triggersResponse.ok) {
        const triggersData = await triggersResponse.json();
        setTriggers(triggersData.triggers || []);
      }

      // Load variables
      const variablesResponse = await fetch(`/api/tracking/gtm-config/${containerId}/variables`);
      if (variablesResponse.ok) {
        const variablesData = await variablesResponse.json();
        setVariables(variablesData.variables || []);
      }

      // Generate installation code
      const container = containers.find(c => c.id === containerId);
      if (container) {
        generateInstallationCode(container.containerId);
      }
    } catch (err) {
      console.error('Error loading container details:', err);
    }
  };

  const generateInstallationCode = (containerId: string) => {
    const code = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
    setGtmCode(code);
  };

  const syncFromGoogleGTM = async (containerId: string) => {
    try {
      const response = await fetch(`/api/tracking/gtm-config/${containerId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to sync from Google GTM');
      }

      // Reload container details after sync
      loadContainerDetails(containerId);
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const publishContainer = async (containerId: string) => {
    try {
      const response = await fetch(`/api/tracking/gtm-config/${containerId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to publish container');
      }

      loadGTMData(); // Reload to see updated status
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused':
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'draft':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const selectedContainerData = containers.find(c => c.id === selectedContainer);
  const activeTags = tags.filter(t => t.status === 'active').length;
  const totalTriggers = triggers.length;
  const totalVariables = variables.length;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading GTM configuration...</p>
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
            onClick={loadGTMData}
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
          <h1 className="text-2xl font-bold text-gray-900">Google Tag Manager</h1>
          <p className="text-gray-600 mt-1">Configure and manage your GTM containers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectedContainer && syncFromGoogleGTM(selectedContainer)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync from GTM
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Plus className="w-4 h-4" />
            Add Container
          </motion.button>
        </div>
      </div>

      {/* Container Selection */}
      {containers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Container Selection</h2>
            
            <select
              value={selectedContainer}
              onChange={(e) => setSelectedContainer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name} ({container.containerId})
                </option>
              ))}
            </select>
          </div>

          {selectedContainerData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedContainerData.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContainerData.status)}`}>
                    {selectedContainerData.status}
                  </span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium text-gray-900">{selectedContainerData.version}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Last Published:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {selectedContainerData.lastPublished 
                    ? new Date(selectedContainerData.lastPublished).toLocaleString() 
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      {containers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeTags}</p>
                <p className="text-sm text-gray-600">Active Tags</p>
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
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTriggers}</p>
                <p className="text-sm text-gray-600">Triggers</p>
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
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalVariables}</p>
                <p className="text-sm text-gray-600">Variables</p>
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
                <Database className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{containers.length}</p>
                <p className="text-sm text-gray-600">Containers</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Installation Code */}
      {gtmCode && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Installation Code</h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showCode ? 'Hide' : 'Show'} Code
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyToClipboard(gtmCode)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </motion.button>
            </div>
          </div>

          {showCode && (
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                <code>{gtmCode}</code>
              </pre>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Installation Instructions</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Add the first code snippet to the &lt;head&gt; of your website and the second snippet 
                  immediately after the opening &lt;body&gt; tag on every page you want to track.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All in GTM
            </motion.button>
          </div>
          
          <div className="space-y-3">
            {tags.slice(0, 5).map((tag) => (
              <div key={tag.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  {getStatusIcon(tag.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{tag.name}</h3>
                    <p className="text-sm text-gray-600">{tag.type}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {tag.firingCount.toLocaleString()} fires
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tag.status)}`}>
                    {tag.status}
                  </span>
                </div>
              </div>
            ))}
            
            {tags.length > 5 && (
              <div className="text-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  View {tags.length - 5} more tags
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Data State */}
      {containers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No GTM Containers</h3>
          <p className="text-gray-600 mb-6">
            Connect your Google Tag Manager account to get started with tracking setup.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Connect GTM Account
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default GTMConfig;