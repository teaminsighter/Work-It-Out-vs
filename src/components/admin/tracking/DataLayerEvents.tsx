'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DataLayerEvent {
  id: string;
  event_name: string;
  description: string;
  parameters: { [key: string]: string };
  trigger_condition: string;
  status: 'active' | 'inactive' | 'testing';
  created_at: string;
  fire_count: number;
}

const DataLayerEvents = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    description: '',
    parameters: '',
    trigger_condition: ''
  });

  // Mock data for existing events
  const [events] = useState<DataLayerEvent[]>([
    {
      id: '1',
      event_name: 'page_view_insights',
      description: 'Tracks page views with user context and UTM parameters',
      parameters: {
        'user_id': 'string',
        'page_url': 'string',
        'utm_source': 'string',
        'utm_medium': 'string',
        'utm_campaign': 'string',
        'timestamp': 'datetime'
      },
      trigger_condition: 'On every page load',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 15420
    },
    {
      id: '2',
      event_name: 'form_step_insights',
      description: 'Tracks form progression and step completion',
      parameters: {
        'user_id': 'string',
        'step_number': 'integer',
        'step_name': 'string',
        'step_data': 'object',
        'time_spent': 'integer',
        'drop_off_point': 'boolean'
      },
      trigger_condition: 'When user completes form step',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 8934
    },
    {
      id: '3',
      event_name: 'ten_second_stay_insights',
      description: 'Tracks engagement when user stays 10+ seconds',
      parameters: {
        'user_id': 'string',
        'page_url': 'string',
        'total_time': 'integer',
        'triggered': 'boolean'
      },
      trigger_condition: 'After 10 seconds on page',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 12567
    },
    {
      id: '4',
      event_name: 'form_submission_insights',
      description: 'Tracks form submissions with conversion value',
      parameters: {
        'user_id': 'string',
        'form_data': 'object',
        'new_submission': 'boolean',
        'conversion_value': 'float',
        'quote_value': 'float'
      },
      trigger_condition: 'On form submission success',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 1234
    },
    {
      id: '5',
      event_name: 'section_engagement_insights',
      description: 'Tracks time spent in specific page sections',
      parameters: {
        'user_id': 'string',
        'section_name': 'string',
        'time_spent': 'integer',
        'scroll_depth': 'integer'
      },
      trigger_condition: 'On section scroll and time thresholds',
      status: 'testing',
      created_at: '2024-09-25',
      fire_count: 234
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEvent = () => {
    console.log('Creating new event:', newEvent);
    // In real implementation, this would call API
    setNewEvent({
      event_name: '',
      description: '',
      parameters: '',
      trigger_condition: ''
    });
  };

  const generateGTMCode = (event: DataLayerEvent) => {
    return `window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': '${event.event_name}',
  'user_id': '{{User ID}}',
${Object.entries(event.parameters).map(([key, type]) => 
  `  '${key}': '{{${key.charAt(0).toUpperCase() + key.slice(1)}}}' // ${type}`
).join(',\n')}
});`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DataLayer Events</h1>
          <p className="text-gray-600">Configure and manage tracking events for analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Export GTM Container
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create Event
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['events', 'gtm-code', 'testing'].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </motion.button>
        ))}
      </div>

      {/* Events List */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Event Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Description</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Fires Count</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event, index) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 font-mono text-sm">
                          {event.event_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {event.created_at}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {event.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.trigger_condition}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {event.fire_count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">total fires</div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="View Code"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Edit Event"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-purple-600 hover:text-purple-700"
                          title="Test Event"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* GTM Code Generator */}
      {activeTab === 'gtm-code' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Google Tag Manager Code Generator</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.slice(0, 2).map((event, index) => (
                <div key={event.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{event.event_name}</h4>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                    >
                      Copy Code
                    </motion.button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre">
                      <code>{generateGTMCode(event)}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium text-blue-900">Implementation Tips</div>
                  <div className="text-blue-700 text-sm mt-1">
                    • All events automatically append "_insights" suffix<br/>
                    • User ID is generated and stored in localStorage<br/>
                    • UTM parameters are captured from URL automatically<br/>
                    • Events fire to GA4, Facebook Pixel, and custom endpoints
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Event Testing */}
      {activeTab === 'testing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Event Testing Console</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Event Trigger */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Test Event Firing</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    {events.map(event => (
                      <option key={event.id} value={event.event_name}>
                        {event.event_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Parameters (JSON)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={4}
                    placeholder='{"user_id": "test_123", "page_url": "https://example.com"}'
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  🧪 Fire Test Event
                </motion.button>
              </div>
            </div>

            {/* Real-time Event Monitor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Live Event Monitor</h4>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Monitoring
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="space-y-2 text-sm font-mono">
                  <div className="text-green-400">
                    [09:15:23] form_step_insights fired → user_123, step: 2
                  </div>
                  <div className="text-blue-400">
                    [09:15:20] page_view_insights fired → /solar-calculator
                  </div>
                  <div className="text-yellow-400">
                    [09:15:15] ten_second_stay_insights fired → user_456
                  </div>
                  <div className="text-green-400">
                    [09:14:58] form_submission_insights fired → €12,500 quote
                  </div>
                  <div className="text-blue-400">
                    [09:14:45] page_view_insights fired → /
                  </div>
                  <div className="text-gray-500">
                    [09:14:30] Monitoring started...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataLayerEvents;