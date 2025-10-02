'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  Globe
} from 'lucide-react';
// Using real export API instead of analytics service

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'csv' | 'pdf' | 'excel' | 'json';
  icon: React.ReactNode;
  fields: string[];
  estimatedSize: string;
  lastGenerated?: string;
}

interface ExportOptions {
  dateRange: string;
  leadStatus: string[];
  leadSource: string[];
  includeFields: string[];
  format: 'csv' | 'pdf' | 'excel' | 'json';
  groupBy?: string;
}

const ExportReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dateRange: '30d',
    leadStatus: [],
    leadSource: [],
    includeFields: ['name', 'email', 'phone', 'address', 'status', 'source', 'value'],
    format: 'csv'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportsHistory, setReportsHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'lead_summary',
      name: 'Lead Summary Report',
      description: 'Complete overview of all leads with key metrics and status breakdown',
      type: 'excel',
      icon: <Users className="w-6 h-6" />,
      fields: ['Basic Info', 'Contact Details', 'Status', 'Source', 'Value', 'Dates'],
      estimatedSize: '~2.3 MB',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'conversion_analysis',
      name: 'Conversion Analysis',
      description: 'Detailed analysis of lead conversion rates by source and timeline',
      type: 'pdf',
      icon: <TrendingUp className="w-6 h-6" />,
      fields: ['Conversion Metrics', 'Source Performance', 'Timeline Analysis', 'ROI Data'],
      estimatedSize: '~1.8 MB'
    },
    {
      id: 'geographic_report',
      name: 'Geographic Distribution',
      description: 'Lead distribution across different locations and regions',
      type: 'csv',
      icon: <Globe className="w-6 h-6" />,
      fields: ['Location Data', 'Regional Stats', 'Address Information', 'Geographic Trends'],
      estimatedSize: '~950 KB',
      lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'financial_report',
      name: 'Financial Overview',
      description: 'Revenue analysis, pipeline value, and financial projections',
      type: 'excel',
      icon: <DollarSign className="w-6 h-6" />,
      fields: ['Pipeline Value', 'Revenue Data', 'Financial Projections', 'ROI Analysis'],
      estimatedSize: '~1.2 MB'
    },
    {
      id: 'marketing_performance',
      name: 'Marketing Performance',
      description: 'Marketing channel effectiveness and campaign performance metrics',
      type: 'pdf',
      icon: <BarChart3 className="w-6 h-6" />,
      fields: ['Channel Performance', 'Campaign Metrics', 'Cost Analysis', 'Attribution Data'],
      estimatedSize: '~2.1 MB',
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'data_export',
      name: 'Raw Data Export',
      description: 'Complete raw data export for external analysis or backup purposes',
      type: 'json',
      icon: <FileJson className="w-6 h-6" />,
      fields: ['All Lead Data', 'Analytics Events', 'Session Data', 'Complete History'],
      estimatedSize: '~5.7 MB'
    }
  ];

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setIsLoading(true);
    
    try {
      // Get analytics data from real APIs
      const [sessionResponse, addressResponse, funnelResponse] = await Promise.all([
        fetch('/api/analytics/session-stats'),
        fetch('/api/analytics/address-analytics'),
        fetch('/api/analytics/funnel')
      ]);
      
      const [sessionStats, addressData, funnelData] = await Promise.all([
        sessionResponse.json(),
        addressResponse.json(),
        funnelResponse.json()
      ]);
      
      setAnalytics({
        sessions: sessionStats,
        address: addressData,
        funnel: funnelData
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      // Set fallback empty data
      setAnalytics({
        sessions: { totalSessions: 0, conversions: 0, conversionRate: 0 },
        address: { totalSearches: 0, uniqueAddresses: 0, popularQueries: {} },
        funnel: []
      });
    }

    // Mock reports history
    const mockHistory = [
      {
        id: 'report_001',
        name: 'Lead Summary Report',
        type: 'excel',
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        size: '2.3 MB',
        downloads: 5,
        status: 'completed'
      },
      {
        id: 'report_002',
        name: 'Marketing Performance',
        type: 'pdf',
        generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        size: '2.1 MB',
        downloads: 3,
        status: 'completed'
      },
      {
        id: 'report_003',
        name: 'Geographic Distribution',
        type: 'csv',
        generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        size: '950 KB',
        downloads: 8,
        status: 'completed'
      }
    ];

    setTimeout(() => {
      setReportsHistory(mockHistory);
      setIsLoading(false);
    }, 1000);
  };

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(true);
    
    try {
      const template = reportTemplates.find(t => t.id === templateId);
      
      const response = await fetch('/api/leads/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: template?.type || 'csv',
          dateRange: exportOptions.dateRange,
          includeFields: exportOptions.includeFields
        })
      });

      if (response.ok) {
        // Create download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${exportOptions.dateRange}.${template?.type || 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Add to history
        const newReport = {
          id: `report_${Date.now()}`,
          name: template?.name || 'Custom Report',
          type: template?.type || 'csv',
          generatedAt: new Date().toISOString(),
          size: `${(blob.size / 1024).toFixed(1)} KB`,
          downloads: 1,
          status: 'completed'
        };
        
        setReportsHistory(prev => [newReport, ...prev]);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (reportId: string) => {
    // In a real app, this would download the actual file
    setReportsHistory(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, downloads: report.downloads + 1 }
          : report
      )
    );
    console.log('Downloading report:', reportId);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'excel': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
      case 'csv': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'json': return <FileJson className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (sizeStr: string) => {
    return sizeStr.replace('~', '');
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading export and reports...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Export & Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download comprehensive lead reports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerateReport('custom')}
            disabled={isGenerating}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#146443' }}
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Custom Report'}
          </motion.button>
        </div>
      </div>

      {/* Quick Stats */}
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
              <p className="text-2xl font-bold text-gray-900">{analytics.sessions?.totalSessions || 0}</p>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-xs text-blue-600">Available for export</p>
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
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reportsHistory.length}</p>
              <p className="text-sm text-gray-600">Generated Reports</p>
              <p className="text-xs text-green-600">Last 30 days</p>
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
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analytics.address?.totalSearches || 0}</p>
              <p className="text-sm text-gray-600">Address Data Points</p>
              <p className="text-xs text-purple-600">Geographic insights</p>
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
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analytics.sessions?.conversionRate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-xs text-yellow-600">Current period</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Report Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate === template.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {template.icon}
                </div>
                <div className="flex items-center gap-1">
                  {getFileIcon(template.type)}
                  <span className="text-xs text-gray-500">{template.type.toUpperCase()}</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{template.estimatedSize}</span>
                {template.lastGenerated && (
                  <span>Last: {new Date(template.lastGenerated).toLocaleDateString()}</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {template.fields.slice(0, 3).map((field, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {field}
                  </span>
                ))}
                {template.fields.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{template.fields.length - 3} more
                  </span>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateReport(template.id);
                }}
                disabled={isGenerating}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Custom Export Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={exportOptions.dateRange}
              onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Status</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">All Sources</option>
              <option value="calculator">Solar Calculator</option>
              <option value="google">Google Ads</option>
              <option value="facebook">Facebook Ads</option>
              <option value="organic">Organic Search</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reports History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Reports</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Report Name</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Type</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Size</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Generated</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Downloads</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportsHistory.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(report.type)}
                      <span className="font-medium text-gray-900">{report.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {report.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-center text-sm text-gray-900">{formatFileSize(report.size)}</td>
                  <td className="py-4 text-center text-sm text-gray-600">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-center text-sm text-gray-900">{report.downloads}</td>
                  <td className="py-4 text-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownloadReport(report.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1 mx-auto"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {reportsHistory.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
            <p className="text-gray-600">Generate your first report using one of the templates above.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ExportReports;