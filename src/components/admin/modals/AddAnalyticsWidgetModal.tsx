'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, PieChart, TrendingUp, Users, DollarSign, Target, Activity, Zap } from 'lucide-react';

interface AddAnalyticsWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: any) => void;
}

const AddAnalyticsWidgetModal = ({ isOpen, onClose, onSave }: AddAnalyticsWidgetModalProps) => {
  const [selectedType, setSelectedType] = useState('');
  const [widgetName, setWidgetName] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('5');

  const widgetTypes = [
    {
      id: 'kpi_card',
      name: 'KPI Card',
      description: 'Single metric display with trend',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'chart_line',
      name: 'Line Chart',
      description: 'Time series data visualization',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'chart_pie',
      name: 'Pie Chart',
      description: 'Distribution and percentages',
      icon: <PieChart className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'user_activity',
      name: 'User Activity',
      description: 'Real-time user behavior',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'revenue_tracker',
      name: 'Revenue Tracker',
      description: 'Financial performance metrics',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'conversion_goals',
      name: 'Conversion Goals',
      description: 'Goal tracking and completion',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'performance_monitor',
      name: 'Performance Monitor',
      description: 'System and page performance',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'quick_insights',
      name: 'Quick Insights',
      description: 'AI-powered data insights',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-pink-500'
    }
  ];

  const dataSources = [
    { id: 'google_analytics', name: 'Google Analytics 4' },
    { id: 'facebook_ads', name: 'Facebook Ads' },
    { id: 'google_ads', name: 'Google Ads' },
    { id: 'leads_database', name: 'Leads Database' },
    { id: 'solar_calculator', name: 'Solar Calculator' },
    { id: 'custom_api', name: 'Custom API' },
    { id: 'webhook_data', name: 'Webhook Data' },
    { id: 'manual_input', name: 'Manual Input' }
  ];

  const handleSave = () => {
    if (!selectedType || !widgetName || !dataSource) return;

    const newWidget = {
      id: Date.now().toString(),
      type: selectedType,
      name: widgetName,
      dataSource,
      refreshInterval: parseInt(refreshInterval),
      createdAt: new Date().toISOString()
    };

    onSave(newWidget);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType('');
    setWidgetName('');
    setDataSource('');
    setRefreshInterval('5');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Analytics Widget</h2>
                <p className="text-gray-600 mt-1">Configure custom metrics and KPIs for your dashboard</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Widget Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Widget Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {widgetTypes.map((type) => (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedType === type.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                        {type.icon}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Widget Configuration */}
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Widget Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Widget Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Widget Name
                      </label>
                      <input
                        type="text"
                        value={widgetName}
                        onChange={(e) => setWidgetName(e.target.value)}
                        placeholder="Enter widget name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Data Source */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Source
                      </label>
                      <select
                        value={dataSource}
                        onChange={(e) => setDataSource(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select data source</option>
                        {dataSources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Refresh Interval */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refresh Interval (minutes)
                      </label>
                      <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="1">Every minute</option>
                        <option value="5">Every 5 minutes</option>
                        <option value="15">Every 15 minutes</option>
                        <option value="30">Every 30 minutes</option>
                        <option value="60">Every hour</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedType || !widgetName || !dataSource}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Widget
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddAnalyticsWidgetModal;