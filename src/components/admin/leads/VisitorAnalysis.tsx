'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  MousePointer, 
  Eye, 
  MapPin, 
  Smartphone,
  Monitor,
  Tablet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  RotateCcw,
  User,
  Calendar,
  Globe,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface VisitorData {
  userId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  deviceType?: string;
  browser?: string;
  country?: string;
  city?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  leadGenerated: boolean;
}

interface VisitorAnalytics {
  summary: {
    totalVisitors: number;
    uniqueVisitors: number;
    totalPageViews: number;
    avgSessionDuration: number;
    topPages: Array<{ page: string; views: number }>;
    trafficSources: Array<{ source: string; visitors: number }>;
  };
  visitors: VisitorData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface DetailedVisitorData {
  userId: string;
  summary: {
    totalSessions: number;
    totalPageViews: number;
    totalDuration: number;
    avgSessionDuration: number;
    totalInteractions: number;
    formStarted: boolean;
    formCompleted: boolean;
    leadGenerated: boolean;
    firstVisit: string;
    lastVisit: string;
  };
  sessions: any[];
  journey: Array<{
    page: string;
    timestamp: string;
    timeOnPage?: number;
    scrollDepth?: number;
    deviceType?: string;
    referrer?: string;
  }>;
  interactions: Array<{
    type: string;
    page: string;
    elementId?: string;
    elementText?: string;
    data: any;
    timestamp: string;
  }>;
  formProgress: Array<{
    formType: string;
    stepNumber: number;
    stepName: string;
    questionId: string;
    questionText: string;
    answerValue?: string;
    answerText?: string;
    timeOnStep?: number;
    isCompleted: boolean;
    isDropOff: boolean;
    timestamp: string;
  }>;
}

const VisitorAnalysis = () => {
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailedVisitor, setDetailedVisitor] = useState<DetailedVisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDevice, setFilterDevice] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadVisitorAnalytics();
  }, [dateRange, currentPage]);

  useEffect(() => {
    if (selectedUserId) {
      loadDetailedVisitor(selectedUserId);
    }
  }, [selectedUserId]);

  const loadVisitorAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/visitor-analytics?range=${dateRange}&page=${currentPage}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setVisitorAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to load visitor analytics:', error);
    }
    setIsLoading(false);
  };

  const loadDetailedVisitor = async (userId: string) => {
    try {
      const response = await fetch(`/api/analytics/visitor-analytics?userId=${userId}&range=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setDetailedVisitor(data.data);
      }
    } catch (error) {
      console.error('Failed to load detailed visitor data:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'click': return <MousePointer className="w-4 h-4 text-green-500" />;
      case 'form_focus': return <Target className="w-4 h-4 text-purple-500" />;
      case 'form_step': return <ArrowRight className="w-4 h-4 text-orange-500" />;
      case 'form_complete': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredVisitors = visitorAnalytics?.visitors.filter(visitor => {
    const matchesSearch = !searchTerm || 
      visitor.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDevice = filterDevice === 'all' || visitor.deviceType === filterDevice;
    
    return matchesSearch && matchesDevice;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading visitor analytics...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Visitor Analysis</h1>
          <p className="text-gray-600 mt-1">Individual visitor tracking and behavior analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadVisitorAnalytics}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
      </div>

      {selectedUserId && detailedVisitor ? (
        /* Detailed Visitor View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedUserId(null);
                  setDetailedVisitor(null);
                }}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to All Visitors
              </motion.button>
            </div>
            <div className="text-sm text-gray-500">
              User ID: {detailedVisitor.userId}
            </div>
          </div>

          {/* Visitor Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{detailedVisitor.summary.totalSessions}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{detailedVisitor.summary.totalPageViews}</p>
                  <p className="text-sm text-gray-600">Page Views</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(detailedVisitor.summary.avgSessionDuration)}</p>
                  <p className="text-sm text-gray-600">Avg Session</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{detailedVisitor.summary.totalInteractions}</p>
                  <p className="text-sm text-gray-600">Interactions</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Journey */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">User Journey</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {detailedVisitor.journey.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{step.page}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                        {step.timeOnPage && <span>Time: {formatDuration(step.timeOnPage)}</span>}
                        {step.scrollDepth && <span>Scroll: {step.scrollDepth.toFixed(0)}%</span>}
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(step.deviceType || 'desktop')}
                          <span>{step.deviceType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Form Progress</h3>
              {detailedVisitor.formProgress.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {detailedVisitor.formProgress.map((form, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{form.stepName}</span>
                        <span className="text-xs text-gray-500">Step {form.stepNumber}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{form.questionText}</p>
                      {form.answerValue && (
                        <p className="text-sm font-medium text-green-600">{form.answerValue}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          form.isCompleted ? 'bg-green-100 text-green-600' :
                          form.isDropOff ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {form.isCompleted ? 'Completed' : form.isDropOff ? 'Dropped Off' : 'In Progress'}
                        </span>
                        {form.timeOnStep && (
                          <span className="text-xs text-gray-500">{formatDuration(form.timeOnStep)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No form activity</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Interactions Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Interaction Timeline</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detailedVisitor.interactions.map((interaction, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    {getInteractionIcon(interaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {interaction.type.replace('_', ' ')} on {interaction.page}
                    </p>
                    {interaction.elementText && (
                      <p className="text-xs text-gray-600 truncate">{interaction.elementText}</p>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(interaction.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        /* All Visitors View */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{visitorAnalytics?.summary.uniqueVisitors || 0}</p>
                  <p className="text-sm text-gray-600">Unique Visitors</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{visitorAnalytics?.summary.totalPageViews || 0}</p>
                  <p className="text-sm text-gray-600">Total Page Views</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(visitorAnalytics?.summary.avgSessionDuration || 0)}</p>
                  <p className="text-sm text-gray-600">Avg Session</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{visitorAnalytics?.visitors.filter(v => v.leadGenerated).length || 0}</p>
                  <p className="text-sm text-gray-600">Converted</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by User ID, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
          </div>

          {/* Visitors List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Visitors</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{visitor.userId.slice(-8)}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {getDeviceIcon(visitor.deviceType || 'desktop')}
                              <span>{visitor.deviceType}</span>
                              {visitor.country && (
                                <>
                                  <span>•</span>
                                  <MapPin className="w-3 h-3" />
                                  <span>{visitor.city}, {visitor.country}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {visitor.duration ? formatDuration(visitor.duration) : 'Active'}
                          </p>
                          <p className="text-gray-500">{visitor.pageViews} page views</p>
                          <p className="text-gray-500">{new Date(visitor.startTime).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {visitor.utmSource && (
                            <p className="text-gray-900">Source: {visitor.utmSource}</p>
                          )}
                          {visitor.referrer && (
                            <p className="text-gray-500 truncate max-w-32">{visitor.referrer}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          visitor.leadGenerated 
                            ? 'bg-green-100 text-green-800'
                            : visitor.endTime
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {visitor.leadGenerated ? 'Converted' : visitor.endTime ? 'Completed' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedUserId(visitor.userId)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Details
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {visitorAnalytics?.pagination && visitorAnalytics.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing {((visitorAnalytics.pagination.page - 1) * visitorAnalytics.pagination.limit) + 1} to{' '}
                    {Math.min(visitorAnalytics.pagination.page * visitorAnalytics.pagination.limit, visitorAnalytics.pagination.total)} of{' '}
                    {visitorAnalytics.pagination.total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(visitorAnalytics.pagination.totalPages, currentPage + 1))}
                      disabled={currentPage >= visitorAnalytics.pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorAnalysis;