'use client';

import { useState, useEffect } from 'react';
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

const DataLayerEventsFixed = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<DataLayerEvent[]>([]);
  const [recentFires, setRecentFires] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    description: '',
    parameters: '',
    trigger_condition: ''
  });

  useEffect(() => {
    loadEvents();
    loadRecentFires();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tracking/datalayer-events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to empty array
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentFires = async () => {
    try {
      const response = await fetch('/api/tracking/datalayer-events/fire?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentFires(data);
      }
    } catch (error) {
      console.error('Error loading recent fires:', error);
      setRecentFires([]);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.event_name || !newEvent.description || !newEvent.trigger_condition) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/tracking/datalayer-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      
      if (response.ok) {
        setNewEvent({
          event_name: '',
          description: '',
          parameters: '',
          trigger_condition: ''
        });
        loadEvents(); // Reload events
        alert('Event created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleTestEvent = async (eventName: string) => {
    try {
      const testParameters = {
        user_id: 'test_user_123',
        page_url: '/test-page',
        utm_source: 'test',
        test_mode: true
      };

      const response = await fetch('/api/tracking/datalayer-events/fire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          parameters: testParameters,
          testMode: true,
          userId: 'test_user',
          sessionId: 'test_session'
        })
      });
      
      if (response.ok) {
        loadRecentFires(); // Reload recent fires
        alert(`Test event '${eventName}' fired successfully!`);
      } else {
        const error = await response.json();
        alert(`Test failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error testing event:', error);
      alert('Test failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading DataLayer events...</p>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create Event
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['events', 'gtm-code', 'testing', 'create'].map((tab) => (
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
          {events.length > 0 ? (
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
                            onClick={() => handleTestEvent(event.event_name)}
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
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Configured</h3>
              <p className="text-gray-600 mb-4">Create your first DataLayer event to start tracking.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Event
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Event Tab */}
      {activeTab === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Create New DataLayer Event</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input
                type="text"
                value={newEvent.event_name}
                onChange={(e) => setNewEvent(prev => ({ ...prev, event_name: e.target.value }))}
                placeholder="e.g., purchase_complete"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this event tracks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parameters (JSON)</label>
              <textarea
                value={newEvent.parameters}
                onChange={(e) => setNewEvent(prev => ({ ...prev, parameters: e.target.value }))}
                placeholder='{"user_id": "string", "value": "number", "currency": "string"}'
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Condition</label>
              <input
                type="text"
                value={newEvent.trigger_condition}
                onChange={(e) => setNewEvent(prev => ({ ...prev, trigger_condition: e.target.value }))}
                placeholder="When should this event fire?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Event
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('events')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
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
            
            {events.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.slice(0, 2).map((event, index) => (
                  <div key={event.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{event.event_name}</h4>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigator.clipboard.writeText(generateGTMCode(event))}
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
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No events available for code generation.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create First Event
                </motion.button>
              </div>
            )}
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
            {/* Real-time Event Monitor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Live Event Monitor</h4>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={loadRecentFires}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    Refresh
                  </motion.button>
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Monitoring
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="space-y-2 text-sm font-mono">
                  {recentFires.length > 0 ? (
                    recentFires.map((fire: any, index: number) => (
                      <div key={index} className={`${fire.testMode ? 'text-yellow-400' : 'text-green-400'}`}>
                        [{fire.timeAgo || 'just now'}] {fire.eventName} fired → {fire.userId}
                        {fire.testMode && ' (TEST)'}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">
                      No recent events. Test events to see live monitoring.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Available Events for Testing */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Test Events</h4>
              
              <div className="space-y-2">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{event.event_name}</div>
                        <div className="text-xs text-gray-500">{event.description}</div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTestEvent(event.event_name)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                      >
                        Test Fire
                      </motion.button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No events available for testing.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataLayerEventsFixed;