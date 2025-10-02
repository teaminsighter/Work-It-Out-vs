'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye,
  Download,
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  Settings,
  BarChart3,
  Key,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { capitalizeAction, capitalizeWords } from '@/utils/textUtils';

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  device: string;
  status: 'success' | 'failed' | 'pending';
  resource: string;
  metadata: Record<string, any>;
}

interface LogSummary {
  totalLogs: number;
  uniqueUsers: number;
  successfulActions: number;
  failedActions: number;
  securityEvents: number;
  todayActivity: number;
}

const ActivityLogs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [expandedLog, setExpandedLog] = useState<string>('');

  useEffect(() => {
    loadActivityLogs();
  }, [dateRange]);

  const loadActivityLogs = async () => {
    setIsLoading(true);
    try {
      const [logsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/admin/activities?timeRange=${dateRange}&limit=50`),
        fetch(`/api/admin/activities/summary?timeRange=${dateRange}`)
      ]);

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        
        const transformedLogs = logsData.data?.activities?.map((activity: any) => ({
          id: activity.id,
          timestamp: activity.timestamp,
          userId: activity.userId,
          userName: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'Unknown User',
          userEmail: activity.user?.email || 'unknown@email.com',
          action: activity.action,
          category: activity.category,
          details: activity.description,
          ipAddress: activity.ipAddress || 'Unknown',
          userAgent: activity.userAgent || 'Unknown',
          location: activity.location || 'Unknown',
          device: activity.device || 'Unknown',
          status: activity.status || 'success',
          resource: activity.resource || '',
          metadata: activity.metadata || {}
        })) || [];

        setLogs(transformedLogs);
      } else {
        setLogs([]);
      }

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.data);
      } else {
        setSummary({
          totalLogs: 0,
          uniqueUsers: 0,
          successfulActions: 0,
          failedActions: 0,
          securityEvents: 0,
          todayActivity: 0
        });
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setLogs([]);
      setSummary({
        totalLogs: 0,
        uniqueUsers: 0,
        successfulActions: 0,
        failedActions: 0,
        securityEvents: 0,
        todayActivity: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Key className="w-4 h-4" />;
      case 'user_management': return <User className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'text-blue-600 bg-blue-100';
      case 'user_management': return 'text-purple-600 bg-purple-100';
      case 'content': return 'text-green-600 bg-green-100';
      case 'system': return 'text-orange-600 bg-orange-100';
      case 'security': return 'text-red-600 bg-red-100';
      case 'analytics': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'authentication', name: 'Authentication' },
    { id: 'user_management', name: 'User Management' },
    { id: 'content', name: 'Content' },
    { id: 'system', name: 'System' },
    { id: 'security', name: 'Security' },
    { id: 'analytics', name: 'Analytics' }
  ];

  const statuses = [
    { id: 'all', name: 'All Statuses' },
    { id: 'success', name: 'Success' },
    { id: 'failed', name: 'Failed' },
    { id: 'pending', name: 'Pending' }
  ];

  const dateRanges = [
    { id: '1h', name: 'Last Hour' },
    { id: '24h', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading activity logs...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">Monitor system activities and user actions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadActivityLogs}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {capitalizeAction('refresh')}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {capitalizeAction('export')}
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{summary.totalLogs}</p>
                <p className="text-xs text-gray-600">Total Logs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{summary.uniqueUsers}</p>
                <p className="text-xs text-gray-600">Unique Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{summary.successfulActions}</p>
                <p className="text-xs text-gray-600">Successful</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{summary.failedActions}</p>
                <p className="text-xs text-gray-600">Failed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{summary.securityEvents}</p>
                <p className="text-xs text-gray-600">Security</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{summary.todayActivity}</p>
                <p className="text-xs text-gray-600">Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {dateRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setExpandedLog(expandedLog === log.id ? '' : log.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getCategoryColor(log.category)}`}>
                        {getCategoryIcon(log.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{log.action}</h3>
                          {getStatusIcon(log.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                            {capitalizeWords(log.category)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.userName}
                          </div>
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(log.device)}
                            {capitalizeWords(log.device)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {log.location}
                          </div>
                          <div>
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedLog === log.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>IP Address:</strong> {log.ipAddress}
                        </div>
                        <div>
                          <strong>Resource:</strong> {log.resource}
                        </div>
                        <div className="md:col-span-2">
                          <strong>User Agent:</strong> {log.userAgent}
                        </div>
                        {Object.keys(log.metadata).length > 0 && (
                          <div className="md:col-span-2">
                            <strong>Metadata:</strong>
                            <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Logs Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;