'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  Eye, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Download
} from 'lucide-react';

interface DuplicateLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  source: string;
  status: string;
  estimatedValue: number;
  duplicateGroup: string;
  confidence: number;
  duplicateReasons: string[];
}

interface DuplicateGroup {
  id: string;
  leads: DuplicateLead[];
  primaryLead: DuplicateLead;
  duplicateCount: number;
  totalValue: number;
  duplicateReasons: string[];
  confidence: number;
}

const DuplicateAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  useEffect(() => {
    loadDuplicateData();
  }, []);

  const loadDuplicateData = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/leads/duplicates');
      const groups = await response.json();
      
      setDuplicateGroups(groups);
    } catch (error) {
      console.error('Error loading duplicate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGroups = duplicateGroups.filter(group => {
    const matchesSearch = searchTerm === '' || 
      group.leads.some(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesConfidence = confidenceFilter === 'all' ||
      (confidenceFilter === 'high' && group.confidence >= 90) ||
      (confidenceFilter === 'medium' && group.confidence >= 70 && group.confidence < 90) ||
      (confidenceFilter === 'low' && group.confidence < 70);

    return matchesSearch && matchesConfidence;
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-red-600 bg-red-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.duplicateCount - 1, 0);
  const totalValue = duplicateGroups.reduce((sum, group) => sum + group.totalValue, 0);
  const highRiskGroups = duplicateGroups.filter(group => group.confidence >= 90).length;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading duplicate analysis...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Duplicate Analysis</h1>
          <p className="text-gray-600 mt-1">Identify and manage duplicate leads</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#146443' }}
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
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{duplicateGroups.length}</p>
              <p className="text-sm text-gray-600">Duplicate Groups</p>
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
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{highRiskGroups}</p>
              <p className="text-sm text-gray-600">High Risk Groups</p>
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
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Pipeline Value</p>
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDuplicates}</p>
              <p className="text-sm text-gray-600">Potential Duplicates</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full sm:w-auto">
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
            
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Confidence</option>
              <option value="high">High Risk (≥90%)</option>
              <option value="medium">Medium Risk (70-89%)</option>
              <option value="low">Low Risk (&lt;70%)</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredGroups.length} of {duplicateGroups.length} groups
          </div>
        </div>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {filteredGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(group.confidence)}`}>
                {group.confidence >= 90 ? 'High Risk' : group.confidence >= 70 ? 'Medium Risk' : 'Low Risk'} ({group.confidence}%)
              </span>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Merge Leads
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </motion.button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Lead Details</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-600">Source</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-600">Value</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {group.leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-600">{lead.email}</div>
                          <div className="text-xs text-gray-500">{lead.phone}</div>
                        </div>
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">{lead.source}</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 text-center text-sm font-medium text-gray-900">
                        €{lead.estimatedValue.toLocaleString()}
                      </td>
                      <td className="py-3 text-center text-xs text-gray-600">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicates Found</h3>
          <p className="text-gray-600">Your lead database appears to be clean.</p>
        </div>
      )}
    </div>
  );
};

export default DuplicateAnalysis;