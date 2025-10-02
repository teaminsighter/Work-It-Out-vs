'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Search,
  Download,
  Eye,
  UserPlus,
  UserMinus,
  Settings,
  Lock,
  Unlock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

interface UserActivity {
  id: number;
  userId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: string;
  description: string;
  timestamp: string;
  metadata: any;
}

interface ActivitySummary {
  totalActivities: number;
  activeUsers: number;
  recentLogins: number;
  criticalActions: number;
  topActions: Array<{ action: string; count: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
  roleActivity: Array<{ role: string; count: number }>;
}

const UserActivityDashboard = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [summary, setSummary] = useState<ActivitySummary>({
    totalActivities: 0,
    activeUsers: 0,
    recentLogins: 0,
    criticalActions: 0,
    topActions: [],
    hourlyActivity: [],
    roleActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<any[]>([]);

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const actionTypes = [
    'USER_LOGIN',
    'USER_LOGOUT',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DEACTIVATED',
    'PASSWORD_CHANGED',
    'PERMISSION_GRANTED',
    'PERMISSION_REVOKED',
    'DATA_EXPORTED',
    'SETTINGS_CHANGED'
  ];

  useEffect(() => {
    loadActivityData();
    loadUsers();
  }, [selectedTimeRange, selectedUser, selectedAction, searchTerm, page]);

  const loadActivityData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange: selectedTimeRange,
        userId: selectedUser,
        action: selectedAction,
        search: searchTerm,
        page: page.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/admin/activities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_LOGIN': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'USER_LOGOUT': return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'USER_CREATED': return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'USER_UPDATED': return <Settings className="w-4 h-4 text-yellow-600" />;
      case 'USER_DEACTIVATED': return <UserMinus className="w-4 h-4 text-red-600" />;
      case 'PASSWORD_CHANGED': return <Lock className="w-4 h-4 text-purple-600" />;
      case 'PERMISSION_GRANTED': return <Unlock className="w-4 h-4 text-green-600" />;
      case 'PERMISSION_REVOKED': return <Lock className="w-4 h-4 text-red-600" />;
      case 'DATA_EXPORTED': return <Download className="w-4 h-4 text-blue-600" />;
      case 'SETTINGS_CHANGED': return <Settings className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    const criticalActions = ['USER_DEACTIVATED', 'PERMISSION_REVOKED', 'PASSWORD_CHANGED'];
    const warningActions = ['USER_UPDATED', 'SETTINGS_CHANGED', 'PERMISSION_GRANTED'];
    
    if (criticalActions.includes(action)) return 'bg-red-50 border-red-200';
    if (warningActions.includes(action)) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const exportActivityReport = async () => {
    try {
      const params = new URLSearchParams({
        timeRange: selectedTimeRange,
        userId: selectedUser,
        action: selectedAction,
        search: searchTerm,
        format: 'csv'
      });

      const response = await fetch(`/api/admin/activities/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-report-${selectedTimeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading activity dashboard...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">User Activity Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor user actions and system activity</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportActivityReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.totalActivities}</p>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-xs text-blue-600">{selectedTimeRange}</p>
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
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-xs text-green-600">Currently active</p>
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
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.recentLogins}</p>
              <p className="text-sm text-gray-600">Recent Logins</p>
              <p className="text-xs text-yellow-600">Last 24 hours</p>
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
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.criticalActions}</p>
              <p className="text-sm text-gray-600">Critical Actions</p>
              <p className="text-xs text-red-600">Requires attention</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Actions
          </h3>
          <div className="space-y-3">
            {summary.topActions.map((action, index) => (
              <div key={action.action} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getActionIcon(action.action)}
                  <span className="text-sm font-medium text-gray-900">
                    {action.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full"
                      style={{ 
                        width: `${(action.count / Math.max(...summary.topActions.map(a => a.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">
                    {action.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Role Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Activity by Role
          </h3>
          <div className="space-y-3">
            {summary.roleActivity.map((role, index) => (
              <div key={role.role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-purple-500' :
                    index === 1 ? 'bg-blue-500' :
                    index === 2 ? 'bg-green-500' :
                    index === 3 ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {role.role.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-purple-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}
                      style={{ 
                        width: `${(role.count / Math.max(...summary.roleActivity.map(r => r.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">
                    {role.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg border ${getActionColor(activity.action)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getActionIcon(activity.action)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {activity.user.firstName} {activity.user.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {activity.user.email} • {activity.user.role}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {activity.action.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-600">No activities match your current filters.</p>
          </div>
        )}

        {/* Pagination */}
        {activities.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing page {page} of activities
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Previous
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage(page + 1)}
                disabled={activities.length < 20}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Next
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserActivityDashboard;