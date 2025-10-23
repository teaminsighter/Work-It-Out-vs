'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Plus, User, Mail, Phone, MapPin, Calendar, 
  Star, MessageSquare, Edit, Trash2, Eye, Tag, Clock, 
  TrendingUp, Users, DollarSign, Target, ChevronDown,
  AlertCircle, CheckCircle, PhoneCall
} from 'lucide-react';
// Using real database APIs instead of mock service
interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  last_visit: string;
  total_visits: number;
  utm_source: string;
  utm_campaign: string;
  conversion_status: 'lead' | 'qualified' | 'customer' | 'lost';
  quote_value: number;
  new_submission: boolean;
  form_steps_completed: number;
  total_form_steps: number;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  source?: string;
  systemDetails?: any;
  tags?: string[];
  notes?: LeadNote[];
}

interface LeadNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  conversionRate: number;
  averageScore: number;
  totalValue: number;
}

const LeadsManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Lead['status'] | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Lead['priority'] | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const response = await fetch('/api/leads');
      const leadsData = await response.json();
      
      // Transform leads to match the interface
      const transformedLeads = leadsData.map((lead: any) => ({
        ...lead,
        priority: 'medium' as const,
        status: lead.conversion_status,
        source: lead.utm_source || 'direct',
        tags: [],
        notes: []
      }));
      
      setLeads(transformedLeads);
      
      // Calculate stats from real data
      const total = transformedLeads.length;
      const statusCounts = transformedLeads.reduce((acc: any, lead: Lead) => {
        const status = lead.conversion_status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      const converted = statusCounts.customer || 0;
      const totalValue = transformedLeads.reduce((sum: number, lead: Lead) => 
        sum + (lead.quote_value || 0), 0
      );
      
      const calculatedStats: LeadStats = {
        total,
        new: statusCounts.lead || 0,
        contacted: 0, // Not tracked in current schema
        qualified: statusCounts.qualified || 0,
        converted,
        conversionRate: total > 0 ? (converted / total) * 100 : 0,
        averageScore: 0, // Not tracked in current schema
        totalValue
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: Lead['status']) => {
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

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    leadsService.updateLead(leadId, { 
      status: newStatus,
      lastContactDate: newStatus === 'contacted' ? new Date().toISOString() : undefined
    });
    refreshData();
  };

  const addLeadNote = (leadId: string, content: string, type: LeadNote['type'] = 'note') => {
    leadsService.addNote(leadId, {
      content,
      type,
      createdBy: 'Current User' // In production, get from auth context
    });
    refreshData();
  };

  const deleteLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      leadsService.deleteLead(leadId);
      refreshData();
      setSelectedLead(null);
      setShowLeadModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-600">Manage and analyze your insurance leads</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refreshData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🔄 Refresh
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Leads</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">€{Math.round((stats as any).averageDealSize / 1000) || 0}K</div>
                <div className="text-sm text-gray-600">Avg Deal Size</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">€{Math.round((stats as any).totalPipelineValue / 1000) || 0}K</div>
                <div className="text-sm text-gray-600">Pipeline Value</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Search leads by name, email, phone, or address..."
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Lead['status'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Lead['priority'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Leads ({filteredLeads.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-orange-800">
                            {lead.name ? lead.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.systemDetails?.systemSize ? `${lead.systemDetails.systemSize.toFixed(1)} kW System` : 'No system details'}
                    </div>
                    <div className="text-sm text-gray-500">
                      €{lead.systemDetails?.estimatedCost?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {lead.utm_source || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className={`w-3 h-3 ${getPriorityColor(lead.priority)}`} />
                        <span className={`text-xs ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowLeadModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      
                      {lead.status === 'new' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateLeadStatus(lead.id, 'contacted')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
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
                {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Leads will appear here once customers complete the solar calculator'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedLead.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedLead.priority)} bg-gray-100`}>
                      {selectedLead.priority} priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{selectedLead.address}</span>
                    </div>
                  </div>
                </div>

                {/* System Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Lead Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Quote Value</div>
                      <div className="font-medium">€{selectedLead.quote_value?.toLocaleString() || '0'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Status</div>
                      <div className="font-medium">{selectedLead.conversion_status || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total Visits</div>
                      <div className="font-medium">{selectedLead.total_visits || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Form Progress</div>
                      <div className="font-medium">{selectedLead.form_steps_completed || 0}/{selectedLead.total_form_steps || 0} steps</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences & Notes */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Preferences</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Phone: {selectedLead.phone || 'Not provided'}</div>
                    <div>Email: {selectedLead.email}</div>
                    <div>Source: {selectedLead.utm_source || 'Unknown'}</div>
                  </div>
                </div>

                {selectedLead.notes && selectedLead.notes.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 space-y-2">
                      {selectedLead.notes.map((note, index) => (
                        <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div className="font-medium">{note.content}</div>
                          <div className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Update Status</h3>
                <div className="flex gap-2">
                  {['new', 'contacted', 'qualified', 'quoted', 'won', 'lost'].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateLeadStatus(selectedLead.id, status as Lead['status'])}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        selectedLead.status === status
                          ? getStatusColor(status as Lead['status'])
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;