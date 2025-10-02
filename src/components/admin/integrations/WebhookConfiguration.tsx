'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ToggleLeft, ToggleRight, Send, CheckCircle, XCircle } from 'lucide-react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

const WebhookConfiguration = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', active: true });
  const [isLoading, setIsLoading] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/webhooks?type=webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.map((webhook: any) => ({
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          active: webhook.isActive
        })));
      } else {
        setMessage({ type: 'error', text: 'Failed to load webhooks' });
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
      setMessage({ type: 'error', text: 'Error loading webhooks' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveWebhook = async (webhook: Partial<Webhook>, isNew = false) => {
    try {
      const endpoint = '/api/integrations/webhooks';
      const method = 'POST';
      const type = isNew ? 'create' : 'update';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          ...webhook,
          isActive: webhook.active
        })
      });
      
      if (response.ok) {
        await loadWebhooks();
        setMessage({ type: 'success', text: `Webhook ${isNew ? 'created' : 'updated'} successfully!` });
        setTimeout(() => setMessage(null), 3000);
        return true;
      } else {
        setMessage({ type: 'error', text: `Failed to ${isNew ? 'create' : 'update'} webhook` });
        setTimeout(() => setMessage(null), 3000);
        return false;
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error ${isNew ? 'creating' : 'updating'} webhook` });
      setTimeout(() => setMessage(null), 3000);
      return false;
    }
  };

  const addWebhook = async () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) {
      setMessage({ type: 'error', text: 'Please fill in both name and URL' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const success = await saveWebhook({
      name: newWebhook.name.trim(),
      url: newWebhook.url.trim(),
      active: newWebhook.active
    }, true);
    
    if (success) {
      setNewWebhook({ name: '', url: '', active: true });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const response = await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'delete', id })
      });
      
      if (response.ok) {
        await loadWebhooks();
        setMessage({ type: 'success', text: 'Webhook deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete webhook' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting webhook' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleWebhook = async (id: string) => {
    const webhook = webhooks.find(w => w.id === id);
    if (webhook) {
      await saveWebhook({ id, active: !webhook.active });
    }
  };

  const updateWebhook = (id: string, field: 'name' | 'url', value: string) => {
    const updatedWebhooks = webhooks.map(webhook =>
      webhook.id === id ? { ...webhook, [field]: value } : webhook
    );
    setWebhooks(updatedWebhooks);
  };

  const saveWebhookField = async (id: string, field: 'name' | 'url', value: string) => {
    await saveWebhook({ id, [field]: value });
  };

  const saveAllWebhooks = async () => {
    setIsLoading(true);
    try {
      // Save all modified webhooks
      await Promise.all(
        webhooks.map(webhook => saveWebhook(webhook))
      );
      setMessage({ type: 'success', text: 'All webhooks saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving webhooks' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async (webhook: Webhook) => {
    setTestingWebhook(webhook.id);
    try {
      const response = await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          webhookId: webhook.id,
          testUrl: webhook.url
        })
      });
      
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [webhook.id]: result.success }));
      
      if (result.success) {
        setMessage({ type: 'success', text: `Test successful for ${webhook.name} (${result.responseTime}ms)` });
      } else {
        setMessage({ type: 'error', text: `Test failed for ${webhook.name}: ${result.message}` });
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [webhook.id]: false }));
      setMessage({ type: 'error', text: `Test failed for ${webhook.name}` });
    } finally {
      setTestingWebhook(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Webhook Configuration</h1>
        <p className="text-gray-600">
          Add and manage webhooks to send lead data to external services (e.g., Zapier, Make.com).
        </p>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Webhooks */}
      <div className="space-y-4 mb-8">
        {webhooks.map((webhook, index) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={webhook.name}
                  onChange={(e) => updateWebhook(webhook.id, 'name', e.target.value)}
                  onBlur={(e) => saveWebhookField(webhook.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Webhook name"
                />
              </div>

              {/* URL */}
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={webhook.url}
                  onChange={(e) => updateWebhook(webhook.id, 'url', e.target.value)}
                  onBlur={(e) => saveWebhookField(webhook.id, 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  placeholder="https://example.com/webhook"
                />
              </div>

              {/* Active Toggle */}
              <div className="md:col-span-1 text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                <button
                  onClick={() => toggleWebhook(webhook.id)}
                  className="inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: webhook.active ? '#146443' : '#d1d5db'
                  }}
                  onMouseEnter={(e) => {
                    if (webhook.active) {
                      e.currentTarget.style.backgroundColor = '#0f5233';
                    } else {
                      e.currentTarget.style.backgroundColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = webhook.active ? '#146443' : '#d1d5db';
                  }}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      webhook.active ? 'translate-x-3' : '-translate-x-3'
                    }`}
                  />
                </button>
              </div>

              {/* Test Button */}
              <div className="md:col-span-2 text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Test</label>
                <button
                  onClick={() => testWebhook(webhook)}
                  disabled={testingWebhook === webhook.id}
                  className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {testingWebhook === webhook.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send size={14} className="mr-1" />
                      Test
                    </>
                  )}
                </button>
                {testResults[webhook.id] !== undefined && (
                  <div className={`flex items-center justify-center mt-1 text-xs ${
                    testResults[webhook.id] ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {testResults[webhook.id] ? (
                      <><CheckCircle size={12} className="mr-1" />Success</>
                    ) : (
                      <><XCircle size={12} className="mr-1" />Failed</>
                    )}
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <div className="md:col-span-1 text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">Delete</label>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Delete webhook"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add New Webhook */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Add New Webhook
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newWebhook.name}
              onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., Zapier, Make, N8N"
            />
          </div>

          {/* URL */}
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>

          {/* Active Toggle */}
          <div className="md:col-span-1 text-center">
            <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <button
              onClick={() => setNewWebhook(prev => ({ ...prev, active: !prev.active }))}
              className="inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: newWebhook.active ? '#146443' : '#d1d5db'
              }}
              onMouseEnter={(e) => {
                if (newWebhook.active) {
                  e.currentTarget.style.backgroundColor = '#0f5233';
                } else {
                  e.currentTarget.style.backgroundColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = newWebhook.active ? '#146443' : '#d1d5db';
              }}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  newWebhook.active ? 'translate-x-3' : '-translate-x-3'
                }`}
              />
            </button>
          </div>

          {/* Spacer for Test Column */}
          <div className="md:col-span-2"></div>

          {/* Add Button */}
          <div className="md:col-span-1">
            <button
              onClick={addWebhook}
              className="w-full text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              style={{ backgroundColor: '#146443' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f5233'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#146443'}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveAllWebhooks}
          disabled={isLoading}
          className="disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
          style={!isLoading ? { backgroundColor: '#146443' } : {}}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = '#0f5233';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = '#146443';
          }}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          ) : (
            <Save className="mr-2" size={18} />
          )}
          Save Webhook Settings
        </motion.button>
      </div>

      {/* Webhook Data Format Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <h4 className="font-semibold text-blue-900 mb-3">Webhook Data Format</h4>
        <p className="text-blue-800 text-sm mb-3">
          When a lead is captured, the following JSON data will be sent to your active webhooks:
        </p>
        <pre className="bg-white border border-blue-200 rounded-lg p-4 text-xs overflow-x-auto">
{`{
  "leadId": "lead_123456",
  "timestamp": "2024-09-26T14:30:00Z",
  "source": "insurance_quote_form",
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+64212345678"
  },
  "quoteDetails": {
    "insuranceType": "Life Insurance",
    "coverageAmount": 250000,
    "annualPremium": 1840,
    "ageGroup": "35-44",
    "healthStatus": "Non-smoker",
    "address": "123 Queen Street, Auckland, New Zealand"
  }
}`}
        </pre>
      </motion.div>
    </div>
  );
};

export default WebhookConfiguration;