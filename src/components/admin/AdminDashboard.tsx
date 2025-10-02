'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminContextProvider, useAdminContext } from '@/contexts/AdminContext';
import { capitalizeAction, capitalizeWords } from '@/utils/textUtils';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import AdminContent from './AdminContent';
import AnalyticsOverview from './analytics/AnalyticsOverview';
import FormAnalyticsDashboard from './analytics/FormAnalyticsDashboard';
import LeadAnalytics from './analytics/LeadAnalytics';
import MarketingAnalytics from './analytics/MarketingAnalytics';
import RealTimeTracking from './analytics/RealTimeTracking';
import VisitorTrackingDashboard from './analytics/VisitorTrackingDashboard';
import AllLeads from './leads/AllLeads';
import DuplicateAnalysis from './leads/DuplicateAnalysis';
import ExportReports from './leads/ExportReports';
import VisitorAnalysis from './leads/VisitorAnalysis';
import ChatbotQuery from './ai/ChatbotQuery';
import AutoReports from './ai/AutoReports';
import Recommendations from './ai/Recommendations';
import PerformanceAlerts from './ai/PerformanceAlerts';
import DataLayerEvents from './tracking/DataLayerEventsFixed';
import GTMConfig from './tracking/GTMConfig';
import PlatformIntegrations from './tracking/PlatformIntegrations';
import ConversionAPI from './tracking/ConversionAPI';
import APIKeyManager from './tracking/APIKeyManager';
import LandingPages from './pagebuilder/LandingPages';
import FormsBuilder from './pagebuilder/FormsBuilder';
import Templates from './pagebuilder/Templates';
import ABTesting from './abTesting/ABTesting';
import GoogleAds from './integrations/GoogleAds';
import FacebookAds from './integrations/FacebookAds';
import GA4Integration from './integrations/GA4Integration';
import WebhookConfiguration from './integrations/WebhookConfiguration';
import APIConfiguration from './settings/APIConfiguration';
import SolarPricing from './settings/SolarPricing';
import GeneralSettings from './settings/GeneralSettings';
import DatabaseSettings from './settings/DatabaseSettings';
import BackupSettings from './settings/BackupSettings';
import UserProfile from './UserProfile';
import LeadsManagement from './leads/LeadsManagement';
import ManageUsers from './users/ManageUsers';
import Permissions from './users/Permissions';
import ActivityLogs from './users/ActivityLogs';
import UserActivityDashboard from './users/UserActivityDashboard';
import AIAssistant from './ai/AIAssistant';

export interface AdminCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  tabs: AdminTab[];
}

export interface AdminTab {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

interface AdminDashboardContentProps {
  userId?: string;
}

const AdminDashboardContent = ({ userId }: AdminDashboardContentProps = {}) => {
  const [activeCategory, setActiveCategory] = useState('analytics');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { updateContext } = useAdminContext();

  // Add mounted state to prevent SSR mismatch
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Update context when category or tab changes
  useEffect(() => {
    const category = adminCategories.find(c => c.id === activeCategory);
    const tab = category?.tabs.find(t => t.id === activeTab);
    
    updateContext({
      currentCategory: activeCategory,
      currentTab: activeTab,
      breadcrumb: ['Admin', category?.name || 'Unknown', tab?.name || 'Unknown'],
      availableActions: getAvailableActions(activeCategory, activeTab)
    });
  }, [activeCategory, activeTab, updateContext]);

  const getAvailableActions = (category: string, tab: string): string[] => {
    const actionMap: Record<string, Record<string, string[]>> = {
      'analytics': {
        'overview': [capitalizeAction('refresh') + ' Data', capitalizeAction('export') + ' Report', capitalizeWords('change date range'), capitalizeAction('view') + ' Details'],
        'forms': [capitalizeWords('analyze funnel'), capitalizeAction('export') + ' Form Data', capitalizeWords('question analysis'), capitalizeWords('answer distribution')],
        'leads': [capitalizeAction('filter') + ' Leads', capitalizeAction('generate') + ' Report', capitalizeWords('quality analysis')],
        'marketing': [capitalizeWords('campaign analysis'), capitalizeWords('ROI report'), capitalizeWords('budget optimization')],
        'realtime': [capitalizeWords('monitor live'), capitalizeAction('set') + ' Alerts', capitalizeAction('view') + ' Sessions'],
        'visitors': [capitalizeWords('behavior analysis'), capitalizeWords('segment visitors'), capitalizeWords('heatmap view')]
      },
      'lead-management': {
        'all-leads': [capitalizeAction('add') + ' Lead', capitalizeAction('update') + ' Status', capitalizeWords('contact lead'), capitalizeAction('export') + ' Leads'],
        'lead-analysis': [capitalizeWords('quality score'), capitalizeWords('trend analysis'), capitalizeWords('conversion report')],
        'ab-testing': [capitalizeAction('create') + ' Test', capitalizeAction('start') + ' Test', capitalizeAction('pause') + ' Test', capitalizeAction('view') + ' Results', capitalizeWords('statistical analysis')],
        'visitor-analysis': [capitalizeAction('view') + ' User Journey', capitalizeWords('track interactions'), capitalizeWords('form analysis'), capitalizeAction('export') + ' Visitor Data'],
        'duplicates': [capitalizeWords('find duplicates'), capitalizeWords('merge leads'), capitalizeWords('clean database')],
        'reports': [capitalizeAction('generate') + ' Report', capitalizeWords('schedule export'), capitalizeWords('custom query')]
      }
    };

    return actionMap[category]?.[tab] || [capitalizeAction('view'), capitalizeAction('export'), capitalizeAction('refresh')];
  };

  // Navigation handler for AI assistant
  const handleAINavigation = (categoryId: string, tabId?: string) => {
    setActiveCategory(categoryId);
    if (tabId) {
      setActiveTab(tabId);
    } else {
      // Reset to first tab when category changes
      const category = adminCategories.find(c => c.id === categoryId);
      if (category && category.tabs.length > 0) {
        setActiveTab(category.tabs[0].id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <AdminSidebar
        activeCategory={activeCategory}
        onCategoryChange={(categoryId) => {
          setActiveCategory(categoryId);
          // Reset to first tab when category changes
          const category = adminCategories.find(c => c.id === categoryId);
          if (category && category.tabs.length > 0) {
            setActiveTab(category.tabs[0].id);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userId={userId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminTopBar
          activeCategory={activeCategory}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNavigate={(categoryId, tabId) => {
            setActiveCategory(categoryId);
            setActiveTab(tabId);
          }}
          userId={userId}
        />

        {/* Content Area */}
        <motion.div
          className="flex-1 overflow-auto"
          key={`${activeCategory}-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <AdminContent 
            activeCategory={activeCategory}
            activeTab={activeTab}
            userId={userId}
          />
        </motion.div>
      </div>

      {/* AI Assistant */}
      <AIAssistant onNavigate={handleAINavigation} />
    </div>
  );
};

// This will be imported from a separate config file
export const adminCategories: AdminCategory[] = [
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    tabs: [
      { id: 'overview', name: 'Overview', component: AnalyticsOverview },
      { id: 'forms', name: 'Form Analytics', component: FormAnalyticsDashboard },
      { id: 'leads', name: 'Lead Analysis', component: LeadAnalytics },
      { id: 'marketing', name: 'Marketing Analysis', component: MarketingAnalytics },
      { id: 'realtime', name: 'Real-time Tracking', component: RealTimeTracking },
      { id: 'visitors', name: 'Visitor Tracking', component: VisitorTrackingDashboard }
    ]
  },
  {
    id: 'lead-management',
    name: 'CRM',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    tabs: [
      { id: 'all-leads', name: 'All Leads', component: LeadsManagement },
      { id: 'lead-analysis', name: 'Lead Analysis', component: AllLeads },
      { id: 'ab-testing', name: 'A/B Testing', component: ABTesting },
      { id: 'visitor-analysis', name: 'Visitor Analysis', component: VisitorAnalysis },
      { id: 'duplicates', name: 'Duplicate Analysis', component: DuplicateAnalysis },
      { id: 'reports', name: 'Export/Reports', component: ExportReports }
    ]
  },
  {
    id: 'page-builder',
    name: 'Page Builder',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    tabs: [
      { id: 'landing-pages', name: 'Landing Pages', component: LandingPages },
      { id: 'forms', name: 'Forms', component: FormsBuilder },
      { id: 'templates', name: 'Templates', component: Templates },
      { id: 'ab-testing', name: 'A/B Testing', component: ABTesting }
    ]
  },
  {
    id: 'tracking',
    name: 'Tracking Setup',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tabs: [
      { id: 'datalayer', name: 'DataLayer Events', component: DataLayerEvents },
      { id: 'gtm-config', name: 'GTM Config', component: GTMConfig },
      { id: 'integrations', name: 'Platform Integrations', component: PlatformIntegrations },
      { id: 'conversion-api', name: 'Conversion API', component: ConversionAPI },
      { id: 'api-keys', name: 'API Key Manager', component: APIKeyManager }
    ]
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tabs: [
      { id: 'chatbot', name: 'Chatbot Query', component: ChatbotQuery },
      { id: 'auto-reports', name: 'Auto Reports', component: AutoReports },
      { id: 'recommendations', name: 'Recommendations', component: Recommendations },
      { id: 'alerts', name: 'Performance Alerts', component: PerformanceAlerts }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    tabs: [
      { id: 'google-ads', name: 'Google Ads', component: GoogleAds },
      { id: 'facebook-ads', name: 'Facebook Ads', component: FacebookAds },
      { id: 'ga4', name: 'GA4', component: GA4Integration },
      { id: 'webhooks', name: 'Webhooks/APIs', component: WebhookConfiguration }
    ]
  },
  {
    id: 'user-management',
    name: 'User Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    tabs: [
      { id: 'profile', name: 'My Profile', component: UserProfile },
      { id: 'admin-users', name: 'Manage Users', component: ManageUsers },
      { id: 'permissions', name: 'Permissions', component: Permissions },
      { id: 'activity-logs', name: 'Activity Logs', component: ActivityLogs },
      { id: 'activity-dashboard', name: 'Activity Dashboard', component: UserActivityDashboard }
    ]
  },
  {
    id: 'system',
    name: 'System Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tabs: [
      { id: 'general', name: 'General Settings', component: GeneralSettings },
      { id: 'api-config', name: 'API Configuration', component: APIConfiguration },
      { id: 'solar-pricing', name: 'Solar Pricing', component: SolarPricing },
      { id: 'database', name: 'Database', component: DatabaseSettings },
      { id: 'backup', name: 'Backup', component: BackupSettings }
    ]
  }
];

interface AdminDashboardProps {
  userId?: string;
}

const AdminDashboard = ({ userId }: AdminDashboardProps) => {
  return (
    <AdminContextProvider>
      <AdminDashboardContent userId={userId} />
    </AdminContextProvider>
  );
};

export default AdminDashboard;