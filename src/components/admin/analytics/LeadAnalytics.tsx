'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MapPin,
  Zap,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Star,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  RefreshCw,
  CalendarDays,
  Eye,
  Edit
} from 'lucide-react';
// Analytics-specific interfaces
interface AnalyticsLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  score: number;
  tags?: string[];
  createdAt: string;
  systemDetails?: {
    estimatedCost: number;
    annualSavings: number;
    address: string;
    propertyType: string;
  };
}

interface AnalyticsData {
  totalLeads: number;
  conversionRate: number;
  averageValue: number;
  totalRevenue: number;
  leadsBySource: { [key: string]: number };
  leadsByStatus: { [key: string]: number };
  revenueByMonth: { month: string; revenue: number; leads: number }[];
  topPerformingRegions: { region: string; leads: number; revenue: number }[];
}

interface LeadAnalyticsStats {
  total: number;
  averageScore: number;
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  sourceBreakdown: Array<{ source: string; count: number; percentage: number }>;
  revenueProjection: {
    totalEstimatedValue: number;
    totalAnnualSavings: number;
    averageLeadValue: number;
  };
}

const LeadAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [leads, setLeads] = useState<AnalyticsLead[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [filteredLeads, setFilteredLeads] = useState<AnalyticsLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'sources' | 'status' | 'trends'>('revenue');
  const [apiStats, setApiStats] = useState<LeadAnalyticsStats | null>(null);

  useEffect(() => {
    loadLeadData();
  }, [selectedTimeframe]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    generateAnalyticsData();
  }, [filteredLeads]);

  const loadLeadData = async () => {
    setIsLoading(true);
    
    try {
      // Get real leads data from analytics API
      const response = await fetch(`/api/analytics/leads?range=${selectedTimeframe}&limit=50`);
      const result = await response.json();
      
      if (result.success && result.data?.leads && result.data.leads.length > 0) {
        // Transform API leads to match our interface
        const transformedLeads: AnalyticsLead[] = result.data.leads.map((lead: any) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source || 'website',
          status: lead.status.toLowerCase(),
          score: lead.score || 0,
          tags: lead.tags || [],
          createdAt: lead.createdAt,
          systemDetails: lead.systemDetails ? {
            estimatedCost: lead.systemDetails.estimatedCost || 0,
            annualSavings: lead.systemDetails.annualSavings || 0,
            address: lead.systemDetails.address || 'No address',
            propertyType: lead.systemDetails.propertyType || 'Unknown'
          } : undefined
        }));
        
        setLeads(transformedLeads);
        
        // Store API statistics
        setApiStats({
          total: result.data.statistics.total,
          averageScore: result.data.statistics.averageScore,
          statusBreakdown: result.data.statistics.statusBreakdown,
          sourceBreakdown: result.data.statistics.sourceBreakdown,
          revenueProjection: result.data.statistics.revenueProjection
        });
      } else {
        // No leads available - set empty state
        setLeads([]);
      }
      
    } catch (error) {
      console.error('Failed to load lead data:', error);
      // Set empty state for production
      setLeads([]);
    }
    
    setIsLoading(false);
  };
  

  const filterLeads = () => {
    let filtered = leads;
    
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        (lead.systemDetails?.address || '').toLowerCase().includes(searchLower) ||
        (lead.phone || '').includes(searchTerm)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    // Priority filter (based on lead score)
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => {
        const priority = lead.score >= 80 ? 'high' : lead.score >= 50 ? 'medium' : 'low';
        return priority === priorityFilter;
      });
    }
    
    setFilteredLeads(filtered);
  };
  
  const generateAnalyticsData = () => {
    if (filteredLeads.length === 0) {
      setAnalyticsData(null);
      return;
    }
    
    // Calculate analytics metrics
    const totalLeads = filteredLeads.length;
    const convertedLeads = filteredLeads.filter(l => l.status === 'converted');
    const conversionRate = totalLeads > 0 ? (convertedLeads.length / totalLeads) * 100 : 0;
    const totalRevenue = convertedLeads.reduce((sum, lead) => sum + (lead.systemDetails?.estimatedCost || 0), 0);
    const averageValue = totalLeads > 0 ? filteredLeads.reduce((sum, lead) => sum + (lead.systemDetails?.estimatedCost || 0), 0) / totalLeads : 0;
    
    // Group by source
    const leadsBySource = filteredLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    // Group by status
    const leadsByStatus = filteredLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    // Generate monthly revenue data
    const monthlyData = generateMonthlyData(filteredLeads);
    
    // Top performing regions
    const regionData = generateRegionData(filteredLeads);
    
    setAnalyticsData({
      totalLeads,
      conversionRate,
      averageValue,
      totalRevenue,
      leadsBySource,
      leadsByStatus,
      revenueByMonth: monthlyData,
      topPerformingRegions: regionData
    });
  };
  
  const generateMonthlyData = (leads: Lead[]) => {
    const monthlyMap = new Map<string, { revenue: number; leads: number }>();
    
    leads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { revenue: 0, leads: 0 });
      }
      
      const data = monthlyMap.get(monthKey)!;
      data.leads += 1;
      if (lead.status === 'won') {
        data.revenue += lead.systemDetails.estimatedCost;
      }
    });
    
    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  };
  
  const generateRegionData = (leads: Lead[]) => {
    const regionMap = new Map<string, { leads: number; revenue: number }>();
    
    leads.forEach(lead => {
      const region = extractRegionFromAddress(lead.address);
      
      if (!regionMap.has(region)) {
        regionMap.set(region, { leads: 0, revenue: 0 });
      }
      
      const data = regionMap.get(region)!;
      data.leads += 1;
      if (lead.status === 'won') {
        data.revenue += lead.systemDetails.estimatedCost;
      }
    });
    
    return Array.from(regionMap.entries())
      .map(([region, data]) => ({ region, ...data }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 5);
  };
  
  const extractRegionFromAddress = (address: string): string => {
    // Extract county/region from Irish addresses
    if (address.includes('Dublin')) return 'Dublin';
    if (address.includes('Cork')) return 'Cork';
    if (address.includes('Galway')) return 'Galway';
    if (address.includes('Limerick')) return 'Limerick';
    if (address.includes('Waterford')) return 'Waterford';
    return 'Other';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'contacted': return <Phone className="w-4 h-4 text-yellow-500" />;
      case 'qualified': return <Star className="w-4 h-4 text-purple-500" />;
      case 'quoted': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'won': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'lost': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'quoted': return 'bg-orange-100 text-orange-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceIcon = (source: string) => {
    const sourceLower = source.toLowerCase();
    
    if (sourceLower.includes('google') || sourceLower.includes('ads')) {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
      );
    }
    
    if (sourceLower.includes('facebook') || sourceLower.includes('meta')) {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      );
    }
    
    if (sourceLower.includes('organic') || sourceLower.includes('search')) {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      );
    }
    
    if (sourceLower.includes('referral')) {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
      );
    }
    
    // Default website/direct icon
    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      </div>
    );
  };

  // Calculate display metrics
  const displayMetrics = analyticsData ? {
    totalLeads: analyticsData.totalLeads,
    newLeads: analyticsData.leadsByStatus['new'] || 0,
    conversionRate: analyticsData.conversionRate,
    averageValue: analyticsData.averageValue,
    totalRevenue: analyticsData.totalRevenue,
    qualifiedLeads: analyticsData.leadsByStatus['qualified'] || 0
  } : {
    totalLeads: 0,
    newLeads: 0,
    conversionRate: 0,
    averageValue: 0,
    totalRevenue: 0,
    qualifiedLeads: 0
  };
  
  const handleEditLead = (lead: Lead) => {
    // For now, just show an alert with lead details
    alert(`Edit Lead: ${lead.firstName} ${lead.lastName}\nEmail: ${lead.email}\nStatus: ${lead.status}\n\nLead editing functionality would open a modal here.`);
  };

  const handleViewLead = (lead: Lead) => {
    // For now, just show an alert with lead details
    alert(`Lead Details: ${lead.firstName} ${lead.lastName}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nAddress: ${lead.address}\nStatus: ${lead.status}\nSystem Size: ${lead.systemDetails.systemSize} kW\nEstimated Cost: €${lead.systemDetails.estimatedCost.toLocaleString()}`);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Phone,Address,Status,Priority,System Size,Estimated Cost,Created Date\n" +
      filteredLeads.map(lead => 
        `"${lead.firstName} ${lead.lastName}","${lead.email}","${lead.phone}","${lead.address}","${lead.status}","${lead.priority}","${lead.systemDetails.systemSize}","${lead.systemDetails.estimatedCost}","${new Date(lead.createdAt).toLocaleDateString()}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lead_analysis_${selectedTimeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading lead analytics...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Lead Analysis</h1>
          <p className="text-gray-600 mt-1">Comprehensive lead performance and pipeline analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadLeadData()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportData}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
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
              <p className="text-2xl font-bold text-gray-900">{displayMetrics.totalLeads}</p>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-xs text-green-600">+{displayMetrics.newLeads} new</p>
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
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{displayMetrics.conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-xs text-green-600">{analyticsData?.leadsByStatus['won'] || 0} closed deals</p>
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
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{Math.round(displayMetrics.averageValue).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Avg Lead Value</p>
              <p className="text-xs text-purple-600">€{Math.round(displayMetrics.totalLeads * displayMetrics.averageValue).toLocaleString()} total pipeline</p>
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
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{Math.round(displayMetrics.totalRevenue).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Revenue Won</p>
              <p className="text-xs text-yellow-600">{displayMetrics.qualifiedLeads} qualified leads</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="quoted">Quoted</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      {analyticsData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Analytics Overview</h3>
            <div className="flex gap-2">
              {(['revenue', 'sources', 'status', 'trends'] as const).map((chart) => (
                <button
                  key={chart}
                  onClick={() => setSelectedChart(chart)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedChart === chart
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {chart.charAt(0).toUpperCase() + chart.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {selectedChart === 'sources' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Lead Sources</h4>
                <div className="space-y-3">
                  {Object.entries(analyticsData.leadsBySource).map(([source, count]) => {
                    const percentage = (count / analyticsData.totalLeads) * 100;
                    return (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{source}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Top Regions</h4>
                <div className="space-y-3">
                  {analyticsData.topPerformingRegions.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{region.region}</div>
                        <div className="text-sm text-gray-600">{region.leads} leads</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">€{region.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedChart === 'status' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(analyticsData.leadsByStatus).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Leads</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Lead</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Source</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">System Size</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Value</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Priority</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Created</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.slice(0, 10).map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
                      <div className="text-sm text-gray-600">{lead.email}</div>
                      <div className="text-xs text-gray-500">{lead.address}</div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getSourceIcon(lead.source)}
                      <span className="text-sm text-gray-900">{lead.source}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center text-sm text-gray-900">{lead.systemDetails.systemSize} kW</td>
                  <td className="py-4 text-center text-sm font-medium text-gray-900">€{lead.systemDetails.estimatedCost.toLocaleString()}</td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(lead.priority)}`}></div>
                    </div>
                  </td>
                  <td className="py-4 text-center text-xs text-gray-600">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditLead(lead)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Lead"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewLead(lead)}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Leads will appear here once customers complete the solar calculator'
                }
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LeadAnalytics;