'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { adminCategories } from './AdminDashboard';
import AddAnalyticsWidgetModal from './modals/AddAnalyticsWidgetModal';
import { usePermissions } from '@/hooks/usePermissions';
import { capitalizeAction, capitalizeWords } from '@/utils/textUtils';

interface AdminTopBarProps {
  activeCategory: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onNavigate?: (categoryId: string, tabId: string) => void;
  userId?: string;
}

interface SearchResult {
  type: 'category' | 'tab' | 'property';
  title: string;
  description: string;
  path: string;
  categoryId: string;
  tabId?: string;
}

const AdminTopBar = ({ activeCategory, activeTab, onTabChange, onNavigate, userId }: AdminTopBarProps) => {
  const currentCategory = adminCategories.find(cat => cat.id === activeCategory);
  const { hasPermission } = usePermissions(userId);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Load settings for custom colors
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Get colors from settings or use defaults
  const getColor = (colorType: string) => {
    if (!settings) return getDefaultColor(colorType);
    return settings[colorType] || getDefaultColor(colorType);
  };

  const getDefaultColor = (colorType: string) => {
    const defaults: { [key: string]: string } = {
      primaryColor: '#146443',
      navbarColor: '#1F2937',
      buttonColor: '#146443',
      secondaryColor: '#10B981'
    };
    return defaults[colorType] || '#146443';
  };

  // Filter tabs based on user permissions
  const visibleTabs = currentCategory?.tabs.filter(tab => 
    hasPermission(activeCategory, tab.id, 'view')
  ) || [];
  
  if (!currentCategory) return null;

  // Get appropriate action for Add New button based on current context
  const getAddNewAction = () => {
    const context = `${activeCategory}-${activeTab}`;
    
    switch (context) {
      case 'analytics-overview':
        return () => setShowAnalyticsModal(true);
      case 'analytics-steps':
        return () => alert('Add New Step Analytics - Create custom conversion funnel tracking');
      case 'analytics-leads':
        return () => alert('Add New Lead Analytics - Set up lead scoring and analysis rules');
      case 'analytics-marketing':
        return () => alert('Add New Marketing Campaign - Create marketing attribution tracking');
      case 'analytics-realtime':
        return () => alert('Add New Real-time Dashboard - Configure live monitoring');
        
      case 'lead-management-all-leads':
        return () => alert('Add New Lead - Manually create a new lead entry');
      case 'lead-management-lead-analysis':
        return () => alert('Add New Lead Analysis Rule - Create custom lead analysis criteria');
      case 'lead-management-duplicates':
        return () => alert('Add New Duplicate Detection Rule - Configure duplicate lead identification');
      case 'lead-management-reports':
        return () => alert('Add New Report Template - Create custom lead reporting template');
        
      case 'page-builder-landing-pages':
        return () => alert('Add New Landing Page - Create a new solar calculator landing page');
      case 'page-builder-forms':
        return () => alert('Add New Form - Build custom lead capture form');
      case 'page-builder-templates':
        return () => alert('Add New Template - Create reusable page template');
      case 'page-builder-ab-testing':
        return () => alert('Add New A/B Test - Set up landing page variation testing');
        
      case 'tracking-datalayer':
        return () => alert('Add New DataLayer Event - Configure custom tracking event');
      case 'tracking-gtm-config':
        return () => alert('Add New GTM Tag - Create Google Tag Manager configuration');
      case 'tracking-integrations':
        return () => alert('Add New Platform Integration - Connect analytics platform');
      case 'tracking-conversion-api':
        return () => alert('Add New Conversion API - Set up server-side tracking');
        
      case 'ai-insights-chatbot':
        return () => alert('Add New Chatbot Query - Create AI-powered customer inquiry');
      case 'ai-insights-auto-reports':
        return () => alert('Add New Auto Report - Schedule automated analytics report');
      case 'ai-insights-recommendations':
        return () => alert('Add New Recommendation Rule - Create AI optimization suggestion');
      case 'ai-insights-alerts':
        return () => alert('Add New Performance Alert - Set up automated monitoring alert');
        
      case 'integrations-google-ads':
        return () => alert('Add New Google Ads Campaign - Connect new advertising campaign');
      case 'integrations-facebook-ads':
        return () => alert('Add New Facebook Campaign - Set up Meta advertising integration');
      case 'integrations-ga4':
        return () => alert('Add New GA4 Property - Connect Google Analytics 4 property');
      case 'integrations-webhooks':
        return () => alert('Add New Webhook - Configure API endpoint integration');
        
      case 'user-management-profile':
        return () => alert('Add New Profile Setting - Configure user profile option');
      case 'user-management-admin-users':
        return () => alert('Add New User - Invite new team member to admin panel');
      case 'user-management-permissions':
        return () => alert('Add New Permission Role - Create custom access level');
      case 'user-management-activity-logs':
        return () => alert('Add New Log Filter - Configure activity monitoring rule');
        
      case 'system-general':
        return () => alert('Add New System Setting - Configure application preference');
      case 'system-api-config':
        return () => alert('Add New API Key - Configure external service integration');
      case 'system-solar-pricing':
        return () => alert('Add New Pricing Tier - Create solar system pricing category');
      case 'system-database':
        return () => alert('Add New Database Connection - Configure additional database');
      case 'system-backup':
        return () => alert('Add New Backup Job - Schedule automated system backup');
        
      default:
        return () => alert(`Add New ${currentCategory.name} - Feature coming soon!`);
    }
  };

  const handleAddNew = getAddNewAction();

  const handleSaveWidget = (widget: any) => {
    console.log('New widget created:', widget);
    // In a real app, this would save to database or state management
    alert(`Widget "${widget.name}" created successfully!`);
  };

  // Generate searchable content from admin categories
  const generateSearchResults = (query: string): SearchResult[] => {
    if (!query || query.length < 2) return [];
    
    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();
    
    adminCategories.forEach(category => {
      // Search category names
      if (category.name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'category',
          title: category.name,
          description: `Main section for ${category.name.toLowerCase()}`,
          path: category.name,
          categoryId: category.id
        });
      }
      
      // Search tab names
      category.tabs.forEach(tab => {
        if (tab.name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'tab',
            title: tab.name,
            description: `${tab.name} functionality`,
            path: `${category.name} > ${tab.name}`,
            categoryId: category.id,
            tabId: tab.id
          });
        }
      });
    });
    
    // Add property searches for common admin features
    const commonProperties = [
      { name: 'leads', category: 'lead-management', tab: 'all-leads', description: 'Customer leads and prospects' },
      { name: 'analytics', category: 'analytics', tab: 'overview', description: 'Performance analytics and metrics' },
      { name: 'users', category: 'user-management', tab: 'admin-users', description: 'User accounts and permissions' },
      { name: 'settings', category: 'system', tab: 'general', description: 'System configuration and preferences' },
      { name: 'tracking', category: 'tracking', tab: 'datalayer', description: 'Visitor and event tracking setup' },
      { name: 'integrations', category: 'integrations', tab: 'google-ads', description: 'Third-party service connections' },
      { name: 'forms', category: 'page-builder', tab: 'forms', description: 'Lead capture and contact forms' },
      { name: 'reports', category: 'lead-management', tab: 'reports', description: 'Data export and reporting tools' }
    ];
    
    commonProperties.forEach(prop => {
      if (prop.name.toLowerCase().includes(searchTerm) || prop.description.toLowerCase().includes(searchTerm)) {
        const category = adminCategories.find(c => c.id === prop.category);
        const tab = category?.tabs.find(t => t.id === prop.tab);
        if (category && tab) {
          results.push({
            type: 'property',
            title: prop.name.charAt(0).toUpperCase() + prop.name.slice(1),
            description: prop.description,
            path: `${category.name} > ${tab.name}`,
            categoryId: prop.category,
            tabId: prop.tab
          });
        }
      }
    });
    
    return results.slice(0, 8); // Limit to 8 results
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = generateSearchResults(query);
    setSearchResults(results);
  };
  
  const handleSearchResultClick = (result: SearchResult) => {
    if (onNavigate && result.tabId) {
      onNavigate(result.categoryId, result.tabId);
    }
    closeSearch();
  };
  
  const closeSearch = () => {
    setShowSearchOverlay(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac or Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchOverlay(true);
      }
      // Escape key to close
      if (e.key === 'Escape' && showSearchOverlay) {
        closeSearch();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearchOverlay]);

  return (
    <>
      <AddAnalyticsWidgetModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        onSave={handleSaveWidget}
      />
      
      {/* Search Overlay */}
      {showSearchOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
          onClick={closeSearch}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tabs, properties, settings..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 text-lg border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchQuery.length >= 2 ? (
                searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full mt-2 ${
                            result.type === 'category' ? 'bg-green-500' : 
                            result.type === 'tab' ? 'bg-blue-500' : 'bg-purple-500'
                          }`} />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{result.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{result.description}</div>
                            <div className="text-xs text-gray-400 mt-1 font-mono">{result.path}</div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {result.type === 'category' ? 'Section' : result.type === 'tab' ? 'Page' : 'Feature'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-sm">No results found for "{searchQuery}"</div>
                    <div className="text-xs mt-1">Try a different search term</div>
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-sm">Start typing to search...</div>
                  <div className="text-xs mt-1">Search for tabs, properties, and settings</div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span>Sections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span>Pages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                    <span>Features</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: getColor('primaryColor') }}>
              {currentCategory.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentCategory.name}
              </h2>
              <p className="text-sm text-gray-500">
                Manage and analyze your {currentCategory.name.toLowerCase()}
              </p>
            </div>
          </div>
          
          {/* Search Shortcut Hint */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md text-xs text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium">⌘</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium">K</kbd>
            <span className="ml-1">to search</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Export Data
          </motion.button>
          
          <motion.button
            onClick={handleAddNew}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:opacity-90"
            style={{ backgroundColor: getColor('buttonColor') }}
          >
            + {capitalizeAction('add')} New
          </motion.button>

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </motion.button>
        </div>
      </div>

      {/* Dynamic Tab Navigation */}
      <div className="px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300'
              }`}
              style={activeTab === tab.id ? { color: getColor('primaryColor'), borderColor: getColor('primaryColor') } : {}}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {tab.name}
              
              {/* Active Tab Indicator */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: getColor('primaryColor') }}
                  layoutId={`activeTab-${activeCategory}`}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium" style={{ color: getColor('primaryColor') }}>
            {settings?.adminPanelName || 'Admin'}
          </span>
          <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{currentCategory.name}</span>
          <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span style={{ color: getColor('primaryColor') }}>
            {visibleTabs.find(tab => tab.id === activeTab)?.name}
          </span>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminTopBar;