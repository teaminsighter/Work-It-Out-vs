'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  last_modified: string;
  views: number;
  conversions: number;
  conversion_rate: number;
  thumbnail: string;
  ab_test?: {
    is_running: boolean;
    variant_name: string;
    traffic_split: number;
  };
}

interface PageTemplate {
  id: string;
  name: string;
  category: 'life' | 'health' | 'generic' | 'funnel';
  preview_image: string;
  components: string[];
  description: string;
}

// Component types for the page builder
interface PageComponent {
  id: string;
  type: string;
  title: string;
  icon: string;
  content: any;
  settings: any;
}

const LandingPages = () => {
  const [activeView, setActiveView] = useState<'list' | 'templates' | 'editor'>('list');
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Page builder states
  const [pageComponents, setPageComponents] = useState<PageComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [pageSettings, setPageSettings] = useState({
    name: 'New Landing Page',
    slug: 'new-landing-page',
    seoTitle: '',
    status: 'draft'
  });
  const dragCounter = useRef(0);

  // Load pages when component mounts and ensure pageComponents is array
  useEffect(() => {
    if (activeView === 'list') {
      loadPages();
    } else if (activeView === 'editor') {
      // Ensure pageComponents is always an array when entering editor
      if (!Array.isArray(pageComponents)) {
        console.warn('pageComponents is not an array, resetting to empty array');
        setPageComponents([]);
      }
    }
  }, [activeView]);

  // Safety check for pageComponents
  useEffect(() => {
    if (activeView === 'editor' && !Array.isArray(pageComponents)) {
      setPageComponents([]);
    }
  }, [pageComponents, activeView]);

  // Available components library
  const componentLibrary = [
    {
      type: 'hero',
      title: 'Hero Section',
      icon: '🎯',
      defaultContent: {
        title: 'Protect Your Family with Life Insurance',
        subtitle: 'Get a custom quote in minutes with our insurance comparison tool',
        buttonText: 'Get Free Quote',
        backgroundImage: ''
      }
    },
    {
      type: 'calculator',
      title: 'Quote Calculator',
      icon: '📊',
      defaultContent: {
        title: 'Insurance Quote Calculator',
        description: 'Calculate your insurance needs and get quotes'
      }
    },
    {
      type: 'testimonials',
      title: 'Testimonials',
      icon: '⭐',
      defaultContent: {
        title: 'What Our Customers Say',
        testimonials: [
          { name: 'John Smith', text: 'Amazing service and great savings!', rating: 5 }
        ]
      }
    },
    {
      type: 'contact',
      title: 'Contact Form',
      icon: '📝',
      defaultContent: {
        title: 'Get Your Free Quote',
        fields: ['name', 'email', 'phone', 'address']
      }
    },
    {
      type: 'features',
      title: 'Feature List',
      icon: '📋',
      defaultContent: {
        title: 'Why Choose Our Insurance?',
        features: [
          { icon: '💰', title: 'Save Money', description: 'Get competitive rates and discounts' },
          { icon: '🛡️', title: 'Peace of Mind', description: 'Protect your family\'s financial future' }
        ]
      }
    },
    {
      type: 'pricing',
      title: 'Pricing Table',
      icon: '💰',
      defaultContent: {
        title: 'Insurance Packages',
        packages: [
          { name: 'Essential Life Cover', price: '$50/month', features: ['$250k Coverage', '24/7 Support'] }
        ]
      }
    }
  ];

  // Add component directly (click to add)
  const handleAddComponent = (componentType: string) => {
    const componentDef = componentLibrary.find(c => c.type === componentType);
    if (componentDef) {
      const newComponent: PageComponent = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        title: componentDef.title,
        icon: componentDef.icon,
        content: componentDef.defaultContent,
        settings: {}
      };
      
      setPageComponents(prev => [...prev, newComponent]);
      setSelectedComponent(newComponent);
    }
  };

  // Component drag and drop handlers
  const handleDragStart = (componentType: string) => {
    setDraggedComponent(componentType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedComponent) {
      const componentDef = componentLibrary.find(c => c.type === draggedComponent);
      if (componentDef) {
        const newComponent: PageComponent = {
          id: `${draggedComponent}-${Date.now()}`,
          type: draggedComponent,
          title: componentDef.title,
          icon: componentDef.icon,
          content: componentDef.defaultContent,
          settings: {}
        };
        
        setPageComponents(prev => [...prev, newComponent]);
      }
      setDraggedComponent(null);
    }
  };

  const handleRemoveComponent = (componentId: string) => {
    setPageComponents(prev => prev.filter(c => c.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleComponentClick = (component: PageComponent) => {
    setSelectedComponent(component);
  };

  const handleComponentUpdate = (componentId: string, updates: any) => {
    setPageComponents(prev => 
      prev.map(c => c.id === componentId ? { ...c, ...updates } : c)
    );
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({ ...selectedComponent, ...updates });
    }
  };

  // Save page functionality
  const handleSavePage = async () => {
    try {
      const pageData = {
        name: pageSettings.name,
        slug: pageSettings.slug,
        template: 'custom',
        content: pageComponents,
        seoTitle: pageSettings.seoTitle,
        seoDescription: '',
        status: pageSettings.status.toUpperCase()
      };

      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Page saved successfully!');
        // Refresh pages list if we're on the list view
        if (activeView === 'list') {
          loadPages();
        }
      } else {
        alert('Failed to save page: ' + result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save page');
    }
  };

  // Preview functionality
  const handlePreview = () => {
    const previewData = {
      settings: pageSettings,
      components: pageComponents
    };
    
    // Store in localStorage for preview
    localStorage.setItem('page-preview', JSON.stringify(previewData));
    
    // Open preview in new tab
    window.open('/preview', '_blank');
  };

  // Load existing page
  const handleLoadPage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages?id=${pageId}`);
      const result = await response.json();
      
      if (result.page) {
        const page = result.page;
        setPageSettings({
          name: page.name,
          slug: page.slug,
          seoTitle: page.seoTitle || '',
          status: page.status.toLowerCase()
        });
        // Ensure page.content is an array
        const content = page.content;
        if (Array.isArray(content)) {
          setPageComponents(content);
        } else {
          console.warn('Page content is not an array:', content);
          setPageComponents([]);
        }
        setActiveView('editor');
      }
    } catch (error) {
      console.error('Load error:', error);
      alert('Failed to load page');
    }
  };

  // Real data for existing pages
  const [pages, setPages] = useState<LandingPage[]>([]); 
  const [loading, setLoading] = useState(false);
  
  // Load pages from database
  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pages');
      const result = await response.json();
      
      if (result.pages) {
        // Transform database pages to match our interface
        const transformedPages = result.pages.map((page: any) => ({
          id: page.id,
          name: page.name,
          slug: page.slug,
          template: page.template,
          status: page.status.toLowerCase(),
          created_at: page.createdAt,
          last_modified: page.updatedAt,
          views: Math.floor(Math.random() * 20000), // Mock for now
          conversions: Math.floor(Math.random() * 500), // Mock for now  
          conversion_rate: Math.random() * 5, // Mock for now
          thumbnail: '/admin/thumbnails/default.jpg'
        }));
        setPages(transformedPages);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (activeView === 'list') {
      loadPages();
    }
  }, [activeView]);
  
  // Original mock pages for fallback
  const mockPages = [
    {
      id: '1',
      name: 'Life Insurance Quote - Auckland',
      slug: 'life-insurance-quote-auckland',
      template: 'life-insurance-quote',
      status: 'published',
      created_at: '2024-09-20T10:00:00Z',
      last_modified: '2024-09-25T14:30:00Z',
      views: 15420,
      conversions: 642,
      conversion_rate: 4.16,
      thumbnail: '/admin/thumbnails/life-insurance.jpg',
      ab_test: {
        is_running: true,
        variant_name: 'Variant B - Trust Theme',
        traffic_split: 50
      }
    },
    {
      id: '2',
      name: 'Health Insurance Plans',
      slug: 'health-insurance-plans',
      template: 'health-focused',
      status: 'published',
      created_at: '2024-09-18T09:15:00Z',
      last_modified: '2024-09-24T11:20:00Z',
      views: 8934,
      conversions: 287,
      conversion_rate: 3.21,
      thumbnail: '/admin/thumbnails/health-insurance.jpg'
    },
    {
      id: '3',
      name: 'Comprehensive Coverage',
      slug: 'comprehensive-coverage',
      template: 'comprehensive',
      status: 'draft',
      created_at: '2024-09-25T16:45:00Z',
      last_modified: '2024-09-26T08:10:00Z',
      views: 234,
      conversions: 12,
      conversion_rate: 5.13,
      thumbnail: '/admin/thumbnails/comprehensive-insurance.jpg'
    }
  ];

  // Mock templates
  const [templates] = useState<PageTemplate[]>([
    {
      id: 'life-insurance-quote',
      name: 'Life Insurance Quote Page',
      category: 'life',
      preview_image: '/admin/templates/life-insurance-template.jpg',
      components: ['Hero Section', 'Quote Calculator', 'Benefits Grid', 'Testimonials', 'Contact Form'],
      description: 'Interactive life insurance calculator with real-time quotes and lead capture'
    },
    {
      id: 'health-focused',
      name: 'Health Insurance Focus',
      category: 'health',
      preview_image: '/admin/templates/health-template.jpg',
      components: ['Hero Video', 'Plan Comparison', 'Premium Calculator', 'Coverage Gallery'],
      description: 'Dedicated health insurance landing page with plan comparison and benefits'
    },
    {
      id: 'comprehensive',
      name: 'Full Coverage Solutions',
      category: 'life',
      preview_image: '/admin/templates/comprehensive-template.jpg',
      components: ['Multi-step Hero', 'Coverage Grid', 'Calculator', 'Process Timeline', 'FAQ'],
      description: 'Complete insurance solution page with multiple coverage options'
    },
    {
      id: 'funnel-step1',
      name: 'Funnel - Step 1',
      category: 'funnel',
      preview_image: '/admin/templates/funnel-template.jpg',
      components: ['Minimal Hero', 'Single Question Form', 'Progress Bar'],
      description: 'High-converting single-step lead capture funnel'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'life': return 'bg-blue-100 text-blue-800';
      case 'health': return 'bg-green-100 text-green-800';
      case 'funnel': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-gray-600">Create and manage high-converting landing pages</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('templates')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📋 Browse Templates
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('editor')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create New Page
          </motion.button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'list', name: 'My Pages', icon: '📄' },
          { id: 'templates', name: 'Templates', icon: '🎨' },
          { id: 'editor', name: 'Page Editor', icon: '✏️' }
        ].map((view) => (
          <motion.button
            key={view.id}
            onClick={() => setActiveView(view.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeView === view.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{view.icon}</span>
            {view.name}
          </motion.button>
        ))}
      </div>

      {/* My Pages View */}
      {activeView === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Pages</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or slug..."
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pages...</p>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && pages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No pages yet</h3>
              <p className="text-gray-600 mb-6">Create your first landing page to get started</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('templates')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Templates
              </motion.button>
            </div>
          )}

          {/* Pages Grid */}
          {!loading && pages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Page Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-400">
                    📱
                  </div>
                  
                  {/* A/B Test Badge */}
                  {page.ab_test?.is_running && (
                    <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      A/B Testing
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(page.status)}`}>
                    {page.status}
                  </div>
                </div>

                {/* Page Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {page.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Preview Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveView('editor')}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    /{page.slug}
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{page.views.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{page.conversions}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{page.conversion_rate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">Rate</div>
                    </div>
                  </div>

                  {/* A/B Test Info */}
                  {page.ab_test?.is_running && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="text-sm font-medium text-purple-800">A/B Test Running</div>
                      </div>
                      <div className="text-xs text-purple-600">
                        {page.ab_test.variant_name} • {page.ab_test.traffic_split}% split
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLoadPage(page.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Edit Page
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePage(page);
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      title="Duplicate Page"
                    >
                      📄
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      title="Delete Page"
                    >
                      🗑️
                    </motion.button>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Modified: {formatDate(page.last_modified)}
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Templates View */}
      {activeView === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>💡 Pro tip: All templates are mobile-responsive and SEO optimized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Template Preview */}
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-8xl text-gray-400">
                    🎨
                  </div>
                  
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
                      Preview Template
                    </motion.button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {template.description}
                  </p>

                  {/* Components List */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Included Components:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.components.slice(0, 3).map((component, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {component}
                        </span>
                      ))}
                      {template.components.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{template.components.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCreateFromTemplate(template)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Use Template
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Preview
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Page Editor View */}
      {activeView === 'editor' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Visual Page Editor</h2>
              <p className="text-gray-600">Drag and drop components to build your perfect landing page</p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePreview}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📱 Preview
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSavePage}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Save Page
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-96">
            {/* Component Library */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Components</h3>
              <div className="space-y-2">
                {componentLibrary.map((component, index) => (
                  <motion.div
                    key={component.type}
                    whileHover={{ scale: 1.02 }}
                    draggable
                    onDragStart={() => handleDragStart(component.type)}
                    onClick={() => handleAddComponent(component.type)}
                    className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-sm transition-shadow hover:border-green-300"
                  >
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {component.icon} {component.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      Drag or click to add
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Page Canvas */}
            <div 
              className="lg:col-span-2 bg-gray-100 rounded-lg p-4 min-h-96 relative"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {pageComponents.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl text-gray-400 mb-4">🎨</div>
                    <div className="text-lg font-medium text-gray-600">Visual Editor Canvas</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Drag components from the left to build your page
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(pageComponents) && pageComponents.map((component, index) => (
                    <ComponentRenderer 
                      key={component.id}
                      component={component}
                      isSelected={selectedComponent?.id === component.id}
                      onClick={() => handleComponentClick(component)}
                      onRemove={() => handleRemoveComponent(component.id)}
                      onUpdate={(updates) => handleComponentUpdate(component.id, updates)}
                    />
                  ))}
                  {!Array.isArray(pageComponents) && (
                    <div className="text-center py-8 text-gray-500">
                      Error: Invalid page components data. Please refresh or create a new page.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings Panel */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">
                {selectedComponent ? 'Component Settings' : 'Page Settings'}
              </h3>
              
              {selectedComponent ? (
                <ComponentSettings
                  component={selectedComponent}
                  onUpdate={(updates) => handleComponentUpdate(selectedComponent.id, updates)}
                />
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Page Name</label>
                    <input 
                      value={pageSettings.name}
                      onChange={(e) => setPageSettings(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm" 
                      placeholder="Enter page name" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">URL Slug</label>
                    <input 
                      value={pageSettings.slug}
                      onChange={(e) => setPageSettings(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm" 
                      placeholder="page-url" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">SEO Title</label>
                    <input 
                      value={pageSettings.seoTitle}
                      onChange={(e) => setPageSettings(prev => ({ ...prev, seoTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm" 
                      placeholder="Page title" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Status</label>
                    <select 
                      value={pageSettings.status}
                      onChange={(e) => setPageSettings(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Component Renderer
interface ComponentRendererProps {
  component: PageComponent;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
  onUpdate: (updates: any) => void;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ 
  component, 
  isSelected, 
  onClick, 
  onRemove 
}) => {
  const renderComponentContent = () => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-lg">
            <h1 className="text-3xl font-bold mb-4">{component.content.title}</h1>
            <p className="text-xl mb-6">{component.content.subtitle}</p>
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium">
              {component.content.buttonText}
            </button>
          </div>
        );
      case 'calculator':
        return (
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{component.content.title}</h2>
            <p className="text-gray-600 mb-4">{component.content.description}</p>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-center text-green-600 font-medium">📊 Calculator Widget Placeholder</div>
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">{component.content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {component.content.testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="text-yellow-400">{'★'.repeat(testimonial.rating)}</div>
                  </div>
                  <p className="text-gray-600 mb-2">"{testimonial.text}"</p>
                  <p className="font-medium text-gray-900">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{component.content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {component.content.fields.map((field: string) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input 
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={`Enter your ${field}`}
                  />
                </div>
              ))}
            </div>
            <button className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
              Submit
            </button>
          </div>
        );
      case 'features':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">{component.content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {component.content.features.map((feature: any, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">{component.content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {component.content.packages.map((pkg: any, index: number) => (
                <div key={index} className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-green-600 mb-4">{pkg.price}</div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature: string, fIndex: number) => (
                      <li key={fIndex} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-gray-500">Unknown component type: {component.type}</div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer ${
        isSelected ? 'ring-2 ring-green-500' : 'hover:ring-2 hover:ring-gray-300'
      }`}
      onClick={onClick}
    >
      {renderComponentContent()}
      
      {/* Component Controls */}
      <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
        isSelected ? 'opacity-100' : ''
      }`}>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
          {component.icon} {component.title}
        </div>
      )}
    </div>
  );
};

// Component Settings Panel
interface ComponentSettingsProps {
  component: PageComponent;
  onUpdate: (updates: any) => void;
}

const ComponentSettings: React.FC<ComponentSettingsProps> = ({ component, onUpdate }) => {
  const handleContentChange = (field: string, value: any) => {
    onUpdate({
      content: {
        ...component.content,
        [field]: value
      }
    });
  };

  const renderSettings = () => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <input
                value={component.content.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Subtitle</label>
              <textarea
                value={component.content.subtitle}
                onChange={(e) => handleContentChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Button Text</label>
              <input
                value={component.content.buttonText}
                onChange={(e) => handleContentChange('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        );
      case 'calculator':
        return (
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <input
                value={component.content.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <textarea
                value={component.content.description}
                onChange={(e) => handleContentChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-16 resize-none"
              />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <input
                value={component.content.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Form Fields</label>
              <div className="text-xs text-gray-500 mb-2">Current: {component.content.fields.join(', ')}</div>
              <div className="text-xs text-gray-500">Fixed for this demo</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            Settings for {component.title} component
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-4 pb-2 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900">
          {component.icon} {component.title}
        </div>
      </div>
      {renderSettings()}
    </div>
  );
};

export default LandingPages;