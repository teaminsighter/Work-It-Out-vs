'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, ChevronDownIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  contactPreference: 'PHONE' | 'EMAIL' | 'BOTH';
  bestTimeToCall?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'CONVERTED' | 'NOT_INTERESTED';
  source: string;
  score: number;
  tags?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Enhanced Tracking Fields
  dateCreated?: string;
  dateModified?: string;
  
  // UTM Parameters
  utmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmContent?: string;
  utmKeyword?: string;
  utmPlacement?: string;
  
  // URL Tracking IDs
  gclid?: string;
  fbclid?: string;
  
  // User/Device Information
  visitorUserId?: string;
  ipAddress?: string;
  device?: string;
  displayAspectRatio?: string;
  defaultLocation?: string;
  
  // Form Tracking
  formId?: string;
  formClass?: string;
  formName?: string;
  
  // Visit Tracking
  firstVisitUrl?: string;
  lastVisitUrl?: string;
  
  // A/B Test Tracking
  abTestId?: string;
  abVariant?: 'A' | 'B';
  
  // Relations
  systemDetails?: {
    systemSize: number;
    estimatedCost: number;
    annualSavings: number;
    paybackPeriod: number;
    panelCount: number;
    roofArea: number;
    monthlyBill: number;
    usageKwh: number;
    address: string;
    propertyType: string;
    roofType: string;
  };
  abTest?: {
    id: string;
    name: string;
    status: string;
  };
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
  category: 'basic' | 'utm' | 'tracking' | 'abtest' | 'system';
}

const AllLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [utmSourceFilter, setUtmSourceFilter] = useState<string>('all');

  // Column configuration with comprehensive tracking fields
  const [columns, setColumns] = useState<ColumnConfig[]>([
    // Basic Information
    { key: 'name', label: 'Name', visible: true, sortable: true, category: 'basic' },
    { key: 'email', label: 'Email', visible: true, sortable: true, category: 'basic' },
    { key: 'phone', label: 'Phone', visible: true, sortable: false, category: 'basic' },
    { key: 'status', label: 'Status', visible: true, sortable: true, category: 'basic' },
    { key: 'source', label: 'Source', visible: true, sortable: true, category: 'basic' },
    { key: 'score', label: 'Lead Score', visible: true, sortable: true, category: 'basic' },
    { key: 'createdAt', label: 'Created', visible: true, sortable: true, category: 'basic' },
    
    // UTM Parameters
    { key: 'utmCampaign', label: 'UTM Campaign', visible: false, sortable: true, category: 'utm' },
    { key: 'utmSource', label: 'UTM Source', visible: false, sortable: true, category: 'utm' },
    { key: 'utmMedium', label: 'UTM Medium', visible: false, sortable: true, category: 'utm' },
    { key: 'utmContent', label: 'UTM Content', visible: false, sortable: true, category: 'utm' },
    { key: 'utmKeyword', label: 'UTM Keyword', visible: false, sortable: true, category: 'utm' },
    { key: 'utmPlacement', label: 'UTM Placement', visible: false, sortable: true, category: 'utm' },
    
    // Tracking Information
    { key: 'gclid', label: 'Google Click ID', visible: false, sortable: false, category: 'tracking' },
    { key: 'fbclid', label: 'Facebook Click ID', visible: false, sortable: false, category: 'tracking' },
    { key: 'visitorUserId', label: 'Visitor ID', visible: false, sortable: false, category: 'tracking' },
    { key: 'ipAddress', label: 'IP Address', visible: false, sortable: false, category: 'tracking' },
    { key: 'device', label: 'Device', visible: false, sortable: true, category: 'tracking' },
    { key: 'defaultLocation', label: 'Location', visible: false, sortable: true, category: 'tracking' },
    { key: 'formId', label: 'Form ID', visible: false, sortable: true, category: 'tracking' },
    { key: 'formName', label: 'Form Name', visible: false, sortable: true, category: 'tracking' },
    { key: 'firstVisitUrl', label: 'First Visit URL', visible: false, sortable: true, category: 'tracking' },
    { key: 'lastVisitUrl', label: 'Last Visit URL', visible: false, sortable: true, category: 'tracking' },
    
    // A/B Testing
    { key: 'abTestName', label: 'A/B Test', visible: false, sortable: true, category: 'abtest' },
    { key: 'abVariant', label: 'A/B Variant', visible: false, sortable: true, category: 'abtest' },
    
    // System Details
    { key: 'systemSize', label: 'System Size (kW)', visible: false, sortable: true, category: 'system' },
    { key: 'estimatedCost', label: 'Estimated Cost', visible: false, sortable: true, category: 'system' },
    { key: 'annualSavings', label: 'Annual Savings', visible: false, sortable: true, category: 'system' },
  ]);

  useEffect(() => {
    loadLeads();
  }, [dateRange, sortField, sortDirection]);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leads?range=${dateRange}&sort=${sortField}&direction=${sortDirection}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setColumns(columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };


  const getVisibleColumns = () => columns.filter(col => col.visible);

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone && lead.phone.includes(searchTerm));
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesUtmSource = utmSourceFilter === 'all' || lead.utmSource === utmSourceFilter;
      
      return matchesSearch && matchesStatus && matchesUtmSource;
    });
  };

  const renderCellValue = (lead: Lead, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return `${lead.firstName} ${lead.lastName}`;
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
            lead.status === 'QUALIFIED' ? 'bg-yellow-100 text-yellow-800' :
            lead.status === 'PROPOSAL_SENT' ? 'bg-blue-100 text-blue-800' :
            lead.status === 'CONTACTED' ? 'bg-purple-100 text-purple-800' :
            lead.status === 'NOT_INTERESTED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {lead.status.replace('_', ' ').toLowerCase()}
          </span>
        );
      case 'score':
        return (
          <div className="flex items-center">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
              lead.score >= 80 ? 'bg-green-100 text-green-800' :
              lead.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              lead.score >= 40 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {lead.score}
            </span>
          </div>
        );
      case 'createdAt':
        return new Date(lead.createdAt).toLocaleDateString();
      case 'abTestName':
        return lead.abTest?.name || '-';
      case 'abVariant':
        return lead.abVariant ? (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
            lead.abVariant === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            Variant {lead.abVariant}
          </span>
        ) : '-';
      case 'systemSize':
        return lead.systemDetails?.systemSize ? `${lead.systemDetails.systemSize} kW` : '-';
      case 'estimatedCost':
        return lead.systemDetails?.estimatedCost ? `$${lead.systemDetails.estimatedCost.toLocaleString()}` : '-';
      case 'annualSavings':
        return lead.systemDetails?.annualSavings ? `$${lead.systemDetails.annualSavings.toLocaleString()}` : '-';
      case 'firstVisitUrl':
        return lead.firstVisitUrl ? (
          <a href={lead.firstVisitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate max-w-xs block">
            {lead.firstVisitUrl}
          </a>
        ) : '-';
      case 'lastVisitUrl':
        return lead.lastVisitUrl ? (
          <a href={lead.lastVisitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate max-w-xs block">
            {lead.lastVisitUrl}
          </a>
        ) : '-';
      default:
        const value = (lead as any)[columnKey];
        return value || '-';
    }
  };

  const visibleColumns = getVisibleColumns();
  const filteredLeads = getFilteredLeads();
  const uniqueUtmSources = [...new Set(leads.map(lead => lead.utmSource).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Analysis</h1>
          <p className="text-gray-600">Enhanced lead tracking with A/B testing insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Columns
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </button>
            
            {showColumnSettings && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Column Visibility</h3>
                  
                  {/* Column toggles in grid layout */}
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {columns.map(column => (
                      <div key={column.key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm text-gray-600 truncate mr-2">{column.label}</span>
                        <button
                          onClick={() => toggleColumnVisibility(column.key)}
                          className={`w-4 h-4 flex-shrink-0 ${
                            column.visible ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {column.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="CONVERTED">Converted</option>
            <option value="NOT_INTERESTED">Not Interested</option>
          </select>
          
          <select
            value={utmSourceFilter}
            onChange={(e) => setUtmSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All UTM Sources</option>
            {uniqueUtmSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading leads...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {visibleColumns.map(column => (
                    <th
                      key={column.key}
                      className={`text-left px-6 py-4 text-sm font-medium text-gray-900 ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable && (
                          <ArrowsUpDownIcon className="w-4 h-4 ml-1 text-gray-400" />
                        )}
                        {sortField === column.key && (
                          <span className="ml-1 text-green-600">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    {visibleColumns.map(column => (
                      <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                        {renderCellValue(lead, column.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredLeads.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No leads found</div>
            <div className="text-sm text-gray-500">
              Try adjusting your filters or search terms
            </div>
          </div>
        )}
        
        {/* Results summary */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Showing {filteredLeads.length} of {leads.length} leads</span>
            <span>{visibleColumns.length} columns visible</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AllLeads;