'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  category: 'solar' | 'battery' | 'general' | 'funnel' | 'form';
  type: 'landing_page' | 'form' | 'email' | 'popup';
  description: string;
  preview_url: string;
  components: string[];
  industry: string[];
  conversion_rate: number;
  usage_count: number;
  created_at: string;
  premium: boolean;
}

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock templates data
  const [templates] = useState<Template[]>([
    {
      id: 'tpl_001',
      name: 'Solar Calculator Pro',
      category: 'solar',
      type: 'landing_page',
      description: 'High-converting solar calculator with step-by-step quote process',
      preview_url: '/templates/solar-calc-pro.jpg',
      components: ['Hero Section', 'Calculator Widget', 'Benefits Grid', 'Testimonials', 'Quote Form'],
      industry: ['solar', 'renewable-energy'],
      conversion_rate: 8.3,
      usage_count: 156,
      created_at: '2024-09-15',
      premium: true
    },
    {
      id: 'tpl_002',
      name: 'Battery Storage Focus',
      category: 'battery',
      type: 'landing_page',
      description: 'Dedicated battery storage landing page with ROI calculator',
      preview_url: '/templates/battery-focus.jpg',
      components: ['Hero Video', 'Feature Comparison', 'ROI Calculator', 'Installation Gallery', 'Contact Form'],
      industry: ['battery', 'energy-storage'],
      conversion_rate: 6.7,
      usage_count: 89,
      created_at: '2024-09-10',
      premium: false
    },
    {
      id: 'tpl_003',
      name: 'Multi-Step Lead Form',
      category: 'funnel',
      type: 'form',
      description: 'Optimized multi-step form with progress bar and conditional logic',
      preview_url: '/templates/multi-step-form.jpg',
      components: ['Progress Bar', 'Conditional Fields', 'Auto-save', 'Validation'],
      industry: ['lead-generation', 'services'],
      conversion_rate: 12.4,
      usage_count: 234,
      created_at: '2024-09-20',
      premium: false
    },
    {
      id: 'tpl_004',
      name: 'Quick Quote Popup',
      category: 'general',
      type: 'popup',
      description: 'Exit-intent popup with simplified quote form',
      preview_url: '/templates/quote-popup.jpg',
      components: ['Exit Intent Trigger', 'Minimal Form', 'Discount Offer'],
      industry: ['services', 'e-commerce'],
      conversion_rate: 4.2,
      usage_count: 67,
      created_at: '2024-09-08',
      premium: true
    },
    {
      id: 'tpl_005',
      name: 'Solar Consultation Email',
      category: 'solar',
      type: 'email',
      description: 'Professional email template for solar consultations',
      preview_url: '/templates/consultation-email.jpg',
      components: ['Header', 'CTA Button', 'Social Proof', 'Footer'],
      industry: ['solar', 'consultations'],
      conversion_rate: 15.8,
      usage_count: 123,
      created_at: '2024-09-12',
      premium: false
    },
    {
      id: 'tpl_006',
      name: 'Home Energy Assessment',
      category: 'general',
      type: 'landing_page',
      description: 'Comprehensive home energy assessment landing page',
      preview_url: '/templates/energy-assessment.jpg',
      components: ['Assessment Tool', 'Results Display', 'Recommendations', 'Booking Calendar'],
      industry: ['energy', 'home-services'],
      conversion_rate: 9.1,
      usage_count: 78,
      created_at: '2024-09-18',
      premium: true
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'solar', name: 'Solar', count: templates.filter(t => t.category === 'solar').length },
    { id: 'battery', name: 'Battery', count: templates.filter(t => t.category === 'battery').length },
    { id: 'general', name: 'General', count: templates.filter(t => t.category === 'general').length },
    { id: 'funnel', name: 'Funnel', count: templates.filter(t => t.category === 'funnel').length }
  ];

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'landing_page', name: 'Landing Pages' },
    { id: 'form', name: 'Forms' },
    { id: 'email', name: 'Emails' },
    { id: 'popup', name: 'Popups' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesType = activeType === 'all' || template.type === activeType;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.components.some(component => component.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'solar': return 'bg-yellow-100 text-yellow-800';
      case 'battery': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'funnel': return 'bg-purple-100 text-purple-800';
      case 'form': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landing_page': return '🌐';
      case 'form': return '📝';
      case 'email': return '✉️';
      case 'popup': return '🗨️';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
          <p className="text-gray-600">Pre-built templates optimized for solar and energy businesses</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📤 Import Template
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create Template
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Templates</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, description, or components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Template Preview */}
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                {getTypeIcon(template.type)}
              </div>
              
              {/* Premium Badge */}
              {template.premium && (
                <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  ⭐ Premium
                </div>
              )}
              
              {/* Category Badge */}
              <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(template.category)}`}>
                {template.category}
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <motion.button
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  👀 Preview
                </motion.button>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {template.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {template.usage_count}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{template.conversion_rate}%</div>
                  <div className="text-xs text-gray-500">Avg. Conversion</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{template.usage_count}</div>
                  <div className="text-xs text-gray-500">Times Used</div>
                </div>
              </div>

              {/* Components List */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Components:</div>
                <div className="flex flex-wrap gap-1">
                  {template.components.slice(0, 3).map((component, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {component}
                    </span>
                  ))}
                  {template.components.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      +{template.components.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Use Template
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  title="Preview"
                >
                  👀
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  title="Duplicate"
                >
                  📄
                </motion.button>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Created: {new Date(template.created_at).toLocaleDateString('en-IE')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🔍</div>
          <div className="text-lg font-medium text-gray-600 mb-2">No templates found</div>
          <div className="text-sm text-gray-500">
            Try adjusting your search criteria or browse different categories
          </div>
        </div>
      )}

      {/* Popular Templates Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Most Popular This Month</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, 3)
            .map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  {getTypeIcon(template.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{template.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{template.usage_count} uses</span>
                    <span>•</span>
                    <span>{template.conversion_rate}% conv.</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  Use
                </motion.button>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;