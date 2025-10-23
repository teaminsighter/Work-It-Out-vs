'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Insurance Form Data
  formType?: string;
  insuranceTypes?: string[];
  existingPolicy?: string;
  whoToCover?: string;
  smokingStatus?: string;
  gender?: string;
  age?: number;
  medicalConditions?: string[];
  healthChanges?: any;
  householdIncome?: string;
  coverageAmount?: string;
  coveragePercentage?: string;
  occupation?: string;
  propertyType?: string;
  vehicleType?: string;
  vehicleAge?: string;
  businessType?: string;
  location?: string;
  
  // SMS & Form Completion
  phoneVerified?: boolean;
  stepsCompleted?: number;
  totalSteps?: number;
  completionRate?: number;
  timeToComplete?: number;
  formStartedAt?: string;
  formCompletedAt?: string;
  
  // Form Steps
  formSteps?: any[];
  
  // Relations
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
  category: 'basic' | 'contact' | 'progress' | 'source' | 'utm' | 'tracking' | 'abtest' | 'form_data' | 'dates';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Column configuration with comprehensive tracking fields
  const [columns, setColumns] = useState<ColumnConfig[]>([
    // Basic Information
    { key: 'name', label: 'Name', visible: true, sortable: true, category: 'basic' },
    { key: 'status', label: 'Status', visible: true, sortable: true, category: 'progress' },
    { key: 'score', label: 'Lead Score', visible: true, sortable: true, category: 'progress' },
    
    // Contact Information
    { key: 'email', label: 'Email', visible: true, sortable: true, category: 'contact' },
    { key: 'phone', label: 'Phone', visible: true, sortable: false, category: 'contact' },
    { key: 'contactPreference', label: 'Contact Preference', visible: false, sortable: true, category: 'contact' },
    { key: 'bestTimeToCall', label: 'Best Time to Call', visible: false, sortable: false, category: 'contact' },
    { key: 'defaultLocation', label: 'Location', visible: false, sortable: true, category: 'contact' },
    
    // Source & UTM
    { key: 'source', label: 'Source', visible: true, sortable: true, category: 'source' },
    { key: 'utmCampaign', label: 'UTM Campaign', visible: false, sortable: true, category: 'utm' },
    { key: 'utmSource', label: 'UTM Source', visible: false, sortable: true, category: 'utm' },
    { key: 'utmMedium', label: 'UTM Medium', visible: false, sortable: true, category: 'utm' },
    { key: 'utmContent', label: 'UTM Content', visible: false, sortable: true, category: 'utm' },
    { key: 'utmKeyword', label: 'UTM Keyword', visible: false, sortable: true, category: 'utm' },
    { key: 'utmPlacement', label: 'UTM Placement', visible: false, sortable: true, category: 'utm' },
    
    // Form & Insurance Data
    { key: 'formType', label: 'Form Type', visible: false, sortable: true, category: 'form_data' },
    { key: 'insuranceTypes', label: 'Insurance Types', visible: false, sortable: true, category: 'form_data' },
    { key: 'existingPolicy', label: 'Existing Policy', visible: false, sortable: true, category: 'form_data' },
    { key: 'whoToCover', label: 'Who to Cover', visible: false, sortable: true, category: 'form_data' },
    { key: 'smokingStatus', label: 'Smoking Status', visible: false, sortable: true, category: 'form_data' },
    { key: 'gender', label: 'Gender', visible: false, sortable: true, category: 'form_data' },
    { key: 'age', label: 'Age', visible: false, sortable: true, category: 'form_data' },
    { key: 'medicalConditions', label: 'Medical Conditions', visible: false, sortable: false, category: 'form_data' },
    { key: 'householdIncome', label: 'Household Income', visible: false, sortable: true, category: 'form_data' },
    { key: 'coverageAmount', label: 'Coverage Amount', visible: false, sortable: true, category: 'form_data' },
    { key: 'coveragePercentage', label: 'Coverage Percentage', visible: false, sortable: true, category: 'form_data' },
    { key: 'occupation', label: 'Occupation', visible: false, sortable: true, category: 'form_data' },
    { key: 'propertyType', label: 'Property Type', visible: false, sortable: true, category: 'form_data' },
    { key: 'vehicleType', label: 'Vehicle Type', visible: false, sortable: true, category: 'form_data' },
    { key: 'vehicleAge', label: 'Vehicle Age', visible: false, sortable: true, category: 'form_data' },
    { key: 'businessType', label: 'Business Type', visible: false, sortable: true, category: 'form_data' },
    { key: 'phoneVerified', label: 'Phone Verified', visible: false, sortable: true, category: 'form_data' },
    { key: 'stepsCompleted', label: 'Steps Completed', visible: false, sortable: true, category: 'form_data' },
    { key: 'completionRate', label: 'Completion Rate', visible: false, sortable: true, category: 'form_data' },
    
    // Tracking Information
    { key: 'gclid', label: 'Google Click ID', visible: false, sortable: false, category: 'tracking' },
    { key: 'fbclid', label: 'Facebook Click ID', visible: false, sortable: false, category: 'tracking' },
    { key: 'visitorUserId', label: 'Visitor User ID', visible: false, sortable: false, category: 'tracking' },
    { key: 'ipAddress', label: 'IP Address', visible: false, sortable: false, category: 'tracking' },
    { key: 'device', label: 'Device Type', visible: false, sortable: true, category: 'tracking' },
    { key: 'displayAspectRatio', label: 'Display Aspect Ratio', visible: false, sortable: false, category: 'tracking' },
    { key: 'formId', label: 'Form ID', visible: false, sortable: true, category: 'tracking' },
    { key: 'formName', label: 'Form Name', visible: false, sortable: true, category: 'tracking' },
    { key: 'firstVisitUrl', label: 'First Visit URL', visible: false, sortable: true, category: 'tracking' },
    { key: 'lastVisitUrl', label: 'Last Visit URL', visible: false, sortable: true, category: 'tracking' },
    
    // A/B Testing
    { key: 'abTestName', label: 'A/B Test', visible: false, sortable: true, category: 'abtest' },
    { key: 'abVariant', label: 'A/B Variant', visible: false, sortable: true, category: 'abtest' },
    
    // Dates
    { key: 'createdAt', label: 'Created Date', visible: true, sortable: true, category: 'dates' },
    { key: 'updatedAt', label: 'Date Lead Modified', visible: false, sortable: true, category: 'dates' },
    { key: 'dateCreated', label: 'Date Lead Created', visible: false, sortable: true, category: 'dates' },
  ]);

  useEffect(() => {
    loadLeads();
  }, [dateRange, sortField, sortDirection]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const selectAllColumns = () => {
    setColumns(columns.map(col => ({ ...col, visible: true })));
  };

  const clearAllColumns = () => {
    setColumns(columns.map(col => ({ ...col, visible: false })));
  };

  const setBasicView = () => {
    setColumns(columns.map(col => ({
      ...col,
      visible: ['name', 'email', 'phone', 'status', 'source', 'createdAt'].includes(col.key)
    })));
  };

  const getColumnsByCategory = () => {
    const categories = {
      'Lead Info': columns.filter(col => ['basic', 'progress'].includes(col.category)),
      'Contact': columns.filter(col => col.category === 'contact'),
      'Source': columns.filter(col => col.category === 'source'),
      'Form Data': columns.filter(col => col.category === 'form_data'),
      'UTM Parameters': columns.filter(col => col.category === 'utm'),
      'Tracking': columns.filter(col => col.category === 'tracking'),
      'A/B Testing': columns.filter(col => col.category === 'abtest'),
      'Dates': columns.filter(col => col.category === 'dates'),
    };
    return categories;
  };


  const getVisibleColumns = () => columns.filter(col => col.visible);

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
      const matchesSearch = searchTerm === '' || 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone && lead.phone.includes(searchTerm));
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesUtmSource = utmSourceFilter === 'all' || lead.utmSource === utmSourceFilter;
      
      return matchesSearch && matchesStatus && matchesUtmSource;
    });
  };

  const renderCellValue = (lead: Lead, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
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
            {lead.status ? lead.status.replace('_', ' ').toLowerCase() : 'unknown'}
          </span>
        );
      case 'score':
        return (
          <div className="flex items-center">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
              (lead.score || 0) >= 80 ? 'bg-green-100 text-green-800' :
              (lead.score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
              (lead.score || 0) >= 40 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {lead.score || 0}
            </span>
          </div>
        );
      case 'createdAt':
      case 'updatedAt':
      case 'dateCreated':
        const dateValue = (lead as any)[columnKey];
        return dateValue ? new Date(dateValue).toLocaleDateString() : '-';
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
      case 'insuranceTypes':
        return lead.insuranceTypes ? lead.insuranceTypes.join(', ') : '-';
      case 'medicalConditions':
        return lead.medicalConditions ? lead.medicalConditions.join(', ') : '-';
      case 'smokingStatus':
        return lead.smokingStatus ? (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
            lead.smokingStatus === 'no' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {lead.smokingStatus === 'no' ? 'Non-smoker' : 'Smoker'}
          </span>
        ) : '-';
      case 'contactPreference':
        return lead.contactPreference ? (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
            {lead.contactPreference}
          </span>
        ) : '-';
      case 'firstVisitUrl':
        return lead.firstVisitUrl ? (
          <a href={lead.firstVisitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate max-w-xs block text-xs">
            {lead.firstVisitUrl.substring(0, 50)}...
          </a>
        ) : '-';
      case 'lastVisitUrl':
        return lead.lastVisitUrl ? (
          <a href={lead.lastVisitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate max-w-xs block text-xs">
            {lead.lastVisitUrl.substring(0, 50)}...
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
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-600">Manage and analyze your insurance leads</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              View Columns
              <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${showColumnSettings ? 'rotate-180' : ''}`} />
            </button>
            
            {showColumnSettings && (
              <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Customize View</h3>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={selectAllColumns}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={setBasicView}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Basic View
                    </button>
                    <button
                      onClick={clearAllColumns}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Categorized column toggles */}
                  <div className="max-h-80 overflow-y-auto">
                    {Object.entries(getColumnsByCategory()).map(([categoryName, categoryColumns]) => (
                      categoryColumns.length > 0 && (
                        <div key={categoryName} className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1 uppercase tracking-wider">
                            {categoryName}
                          </h4>
                          <div className="grid grid-cols-2 gap-1">
                            {categoryColumns.map(column => (
                              <label key={column.key} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={column.visible}
                                  onChange={() => toggleColumnVisibility(column.key)}
                                  className="w-3 h-3 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-1"
                                />
                                <span className="text-xs text-gray-700 truncate flex-1">{column.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
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
            <table className="w-full min-w-full table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {visibleColumns.map(column => (
                    <th
                      key={column.key}
                      className={`text-left px-3 py-2 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center">
                        <span className="truncate">{column.label}</span>
                        {column.sortable && (
                          <ArrowsUpDownIcon className="w-3 h-3 ml-1 text-gray-400" />
                        )}
                        {sortField === column.key && (
                          <span className="ml-1 text-green-600 text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-150">
                    {visibleColumns.map(column => (
                      <td key={column.key} className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                        <div className="max-w-xs truncate">
                          {renderCellValue(lead, column.key)}
                        </div>
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
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Showing {filteredLeads.length} of {leads.length} leads</span>
            <span>{visibleColumns.length} of {columns.length} columns visible</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AllLeads;