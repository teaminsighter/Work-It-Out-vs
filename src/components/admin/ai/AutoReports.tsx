'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Send,
  Eye,
  Download,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Mail,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Brain,
  Zap,
  Globe,
  Activity
} from 'lucide-react';

interface AutoReport {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  frequency: string;
  recipients: string[];
  status: 'active' | 'paused' | 'draft';
  lastGenerated: string;
  nextScheduled: string;
  metrics: string[];
  format: 'pdf' | 'html' | 'excel';
  aiInsights: boolean;
  deliveryCount: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  category: 'performance' | 'leads' | 'marketing' | 'financial';
  description: string;
  metrics: string[];
  aiFeatures: string[];
  estimatedTime: string;
  popularity: number;
}

interface ReportHistory {
  id: string;
  reportName: string;
  generatedAt: string;
  deliveredTo: number;
  status: 'delivered' | 'failed' | 'pending';
  insights: number;
  fileSize: string;
}

const AutoReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<AutoReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [selectedTab, setSelectedTab] = useState<'reports' | 'templates' | 'history'>('reports');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const createReportFromTemplate = async (templateId: string) => {
    try {
      const response = await fetch('/api/ai/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          templateId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Report generated:', result);
        // Refresh the reports list
        loadReportsData();
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const toggleReportStatus = async (reportId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch('/api/ai/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reportId,
          status: newStatus
        }),
      });

      if (response.ok) {
        // Update local state
        setReports(prev => prev.map(report => 
          report.id === reportId ? { ...report, status: newStatus as any } : report
        ));
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setIsLoading(true);
    
    try {
      const [reportsRes, templatesRes, historyRes] = await Promise.all([
        fetch('/api/ai/reports?type=reports'),
        fetch('/api/ai/reports?type=templates'),
        fetch('/api/ai/reports?type=history')
      ]);

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
      // Set empty arrays on error to prevent crashes
      setReports([]);
      setTemplates([]);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'paused':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'draft':
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'text-blue-600 bg-blue-100';
      case 'leads': return 'text-green-600 bg-green-100';
      case 'marketing': return 'text-purple-600 bg-purple-100';
      case 'financial': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const activeReports = reports.filter(r => r.status === 'active').length;
  const totalDeliveries = reports.reduce((sum, r) => sum + r.deliveryCount, 0);
  const aiEnabledReports = reports.filter(r => r.aiInsights).length;
  const recentDeliveries = history.filter(h => h.status === 'delivered').length;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading auto reports...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Auto Reports</h1>
          <p className="text-gray-600 mt-1">AI-powered automated reporting system</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#146443' }}
        >
          <Plus className="w-4 h-4" />
          Create Report
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeReports}</p>
              <p className="text-sm text-gray-600">Active Reports</p>
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
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDeliveries}</p>
              <p className="text-sm text-gray-600">Total Deliveries</p>
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
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{aiEnabledReports}</p>
              <p className="text-sm text-gray-600">AI-Enhanced</p>
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
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{recentDeliveries}</p>
              <p className="text-sm text-gray-600">Recent Success</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          {[
            { id: 'reports', name: 'Active Reports', count: reports.length },
            { id: 'templates', name: 'Templates', count: templates.length },
            { id: 'history', name: 'History', count: history.length }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedTab === tab.id
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.name} ({tab.count})
            </motion.button>
          ))}
        </div>

        {/* Active Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{report.name}</h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(report.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      {report.aiInsights && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          AI Insights
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-2 text-gray-900">{report.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Recipients:</span>
                        <span className="ml-2 text-gray-900">{report.recipients.length} users</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Generated:</span>
                        <span className="ml-2 text-gray-900">{new Date(report.lastGenerated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {report.metrics.map((metric, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleReportStatus(report.id, report.status)}
                      className={`p-2 rounded transition-colors ${
                        report.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {report.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Templates Tab */}
        {selectedTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Estimated Time:</span>
                        <span className="ml-2 text-gray-900">{template.estimatedTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Popularity:</span>
                        <span className="ml-2 text-gray-900">{template.popularity}%</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-1">AI Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.aiFeatures.map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createReportFromTemplate(template.id)}
                  className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  style={{ backgroundColor: '#146443', color: 'white' }}
                >
                  Use Template
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Report</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Generated</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Recipients</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">AI Insights</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Size</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{item.reportName}</div>
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">
                      {new Date(item.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getStatusIcon(item.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">
                      {item.deliveredTo}
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">
                      {item.insights}
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">
                      {item.fileSize}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoReports;