'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Activity,
  Clock,
  Shield,
  Eye,
  Download,
  Calendar,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  User,
  Mail,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';

interface UserActivitySummary {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  topActions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  recentActivities: Array<{
    id: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    status: string;
  }>;
  dailyActivity: Array<{
    date: string;
    actions: number;
    users: number;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  locationStats: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

const ActivityDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<UserActivitySummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [expandedSection, setExpandedSection] = useState<string>('');

  useEffect(() => {
    loadUsers();
    loadActivitySummary();
  }, []);

  useEffect(() => {
    loadActivitySummary();
  }, [timeRange, selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=100');
      if (response.ok) {
        const data = await response.json();
        const usersData = data.data?.users?.map((user: any) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        })) || [];
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadActivitySummary = async () => {
    setIsLoading(true);
    try {
      const userParam = selectedUser !== 'all' ? `&userId=${selectedUser}` : '';
      const response = await fetch(`/api/admin/activities/summary?timeRange=${timeRange}${userParam}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data.data || createMockSummary());
      } else {
        setSummary(createMockSummary());
      }
    } catch (error) {
      console.error('Error loading activity summary:', error);
      setSummary(createMockSummary());
    } finally {
      setIsLoading(false);
    }
  };

  const createMockSummary = (): UserActivitySummary => ({
    totalUsers: 156,
    activeUsers: 89,
    newUsers: 12,
    topActions: [
      { action: 'View Dashboard', count: 234, percentage: 35 },
      { action: 'Export Data', count: 156, percentage: 23 },
      { action: 'Update Profile', count: 98, percentage: 15 },
      { action: 'Login', count: 87, percentage: 13 },
      { action: 'Manage Users', count: 65, percentage: 10 }
    ],
    recentActivities: [
      { id: '1', userId: 'u1', userName: 'John Smith', action: 'Updated user permissions', timestamp: new Date().toISOString(), status: 'success' },
      { id: '2', userId: 'u2', userName: 'Sarah Johnson', action: 'Exported user data', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'success' },
      { id: '3', userId: 'u3', userName: 'Mike Wilson', action: 'Login failed', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'failed' },
      { id: '4', userId: 'u4', userName: 'Lisa Brown', action: 'Created new user', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'success' },
      { id: '5', userId: 'u5', userName: 'Tom Davis', action: 'Updated settings', timestamp: new Date(Date.now() - 1200000).toISOString(), status: 'success' }
    ],
    dailyActivity: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      actions: Math.floor(Math.random() * 50) + 20,
      users: Math.floor(Math.random() * 20) + 10
    })).reverse(),
    deviceStats: [
      { device: 'Desktop', count: 145, percentage: 65 },
      { device: 'Mobile', count: 58, percentage: 26 },
      { device: 'Tablet', count: 20, percentage: 9 }
    ],
    locationStats: [
      { location: 'Auckland', count: 89, percentage: 40 },
      { location: 'Wellington', count: 56, percentage: 25 },
      { location: 'Christchurch', count: 34, percentage: 15 },
      { location: 'Hamilton', count: 23, percentage: 10 },
      { location: 'Other', count: 21, percentage: 10 }
    ]
  });

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'tablet': return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const timeRanges = [
    { id: '24h', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' },
    { id: '90d', name: 'Last 90 Days' }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading activity dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Dashboard</h1>
          <p className="text-gray-600 mt-1">User behavior analytics and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            {(users || []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.role})
              </option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {timeRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.name}
              </option>
            ))}
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadActivitySummary}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* User Selection Indicator */}
      {selectedUser !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Showing activity for: {(users || []).find(u => u.id === selectedUser)?.firstName} {(users || []).find(u => u.id === selectedUser)?.lastName}
            </span>
            <button
              onClick={() => setSelectedUser('all')}
              className="ml-auto text-blue-600 hover:text-blue-800 text-sm"
            >
              View All Users
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
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
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.newUsers}</p>
              <p className="text-sm text-gray-600">New Users</p>
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
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {summary.topActions.reduce((sum, action) => sum + action.count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Actions</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Actions</h3>
            <button
              onClick={() => setExpandedSection(expandedSection === 'actions' ? '' : 'actions')}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSection === 'actions' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="space-y-4">
            {summary.topActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <span className="text-gray-900 font-medium">{action.action}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{action.count}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${action.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{action.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Device Usage</h3>
            <button
              onClick={() => setExpandedSection(expandedSection === 'devices' ? '' : 'devices')}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSection === 'devices' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="space-y-4">
            {summary.deviceStats.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getDeviceIcon(device.device)}
                  </div>
                  <span className="text-gray-900 font-medium">{device.device}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{device.count}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{device.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <button
            onClick={() => setExpandedSection(expandedSection === 'recent' ? '' : 'recent')}
            className="text-gray-400 hover:text-gray-600"
          >
            {expandedSection === 'recent' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="space-y-3">
          {summary.recentActivities.slice(0, expandedSection === 'recent' ? undefined : 5).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{activity.userName}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'success' 
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{activity.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
          <button
            onClick={() => setExpandedSection(expandedSection === 'locations' ? '' : 'locations')}
            className="text-gray-400 hover:text-gray-600"
          >
            {expandedSection === 'locations' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.locationStats.map((location, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{location.location}</span>
                </div>
                <span className="text-sm text-gray-500">{location.percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${location.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{location.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Fixed array safety issues - last updated at 14:52
export default ActivityDashboard;