'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextState {
  currentCategory: string;
  currentTab: string;
  currentData: any;
  pageMetrics: any;
  availableActions: string[];
  breadcrumb: string[];
}

interface AdminContextType {
  state: AdminContextState;
  updateContext: (updates: Partial<AdminContextState>) => void;
  getContextForAI: () => string;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AdminContextState>({
    currentCategory: 'analytics',
    currentTab: 'overview',
    currentData: null,
    pageMetrics: null,
    availableActions: [],
    breadcrumb: ['Admin', 'Analytics Dashboard', 'Overview']
  });

  const updateContext = (updates: Partial<AdminContextState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const getContextForAI = (): string => {
    const context = `
CURRENT ADMIN PANEL CONTEXT:
- Current Section: ${state.currentCategory}
- Current Tab: ${state.currentTab}  
- Breadcrumb: ${state.breadcrumb.join(' → ')}
- Available Actions: ${state.availableActions.join(', ')}

CURRENT PAGE DATA:
${state.currentData ? JSON.stringify(state.currentData, null, 2) : 'No specific data loaded'}

PAGE METRICS:
${state.pageMetrics ? JSON.stringify(state.pageMetrics, null, 2) : 'No metrics available'}

SECTION DETAILS:
${getSectionDetails(state.currentCategory, state.currentTab)}
`;
    return context;
  };

  const getSectionDetails = (category: string, tab: string): string => {
    const sectionMap: Record<string, Record<string, string>> = {
      'analytics': {
        'overview': `
ANALYTICS OVERVIEW TAB:
- Key Metrics: Total Leads (1,234), Conversion Rate (4.2%), Revenue Attribution (€45,678)
- Top Performing Sources: Google Ads (456 leads), Facebook Ads (234 leads), Organic Search (345 leads)
- Available Actions: Refresh Data, Export Data, View Details, Filter by Date Range
- Charts: Performance trends, source comparison, conversion funnel
- Features: Real-time data updates, interactive charts, drill-down analytics
        `,
        'steps': `
STEP ANALYTICS TAB:
- Conversion Funnel Analysis: Landing Page View → Calculator → System Size → Contact → Lead → Quote → Convert
- Drop-off Points: Identifies where users exit the funnel
- Available Actions: View Step Details, Export Funnel Data, A/B Test Analysis
- Features: Step-by-step conversion rates, optimization suggestions, funnel visualization
        `,
        'leads': `
LEAD ANALYSIS TAB:
- Lead Quality Scoring: High/Medium/Low priority categorization
- Source Performance: ROI analysis by traffic source
- Available Actions: Filter by Quality, Export Lead Reports, View Conversion Metrics
- Features: Lead scoring algorithms, predictive analytics, quality assessment
        `,
        'marketing': `
MARKETING ANALYSIS TAB:
- Campaign Performance: Google Ads, Facebook Ads, Email campaigns
- ROI Metrics: Cost per lead, conversion rates, revenue attribution
- Available Actions: Campaign Comparison, Budget Optimization, Performance Reports
- Features: Multi-channel attribution, campaign effectiveness analysis
        `,
        'realtime': `
REAL-TIME TRACKING TAB:
- Live Visitor Count: Currently active users on website
- Live Activity: Page views, interactions, form submissions
- Available Actions: View Live Sessions, Monitor Conversions, Real-time Alerts
- Features: Live visitor tracking, real-time notifications, instant analytics
        `,
        'visitors': `
VISITOR TRACKING TAB:
- Visitor Behavior: Page flows, session duration, bounce rates
- Geographic Data: Visitor locations, device types, browsers
- Available Actions: Segment Analysis, Behavior Reports, Heatmap Analysis
- Features: User journey mapping, behavioral insights, visitor segmentation
        `
      },
      'lead-management': {
        'all-leads': `
ALL LEADS TAB:
- Complete CRM system with lead lifecycle management
- Lead statuses: New → Contacted → Qualified → Proposal Sent → Converted/Lost
- Available Actions: Contact Lead, Update Status, Add Notes, Schedule Follow-up
- Features: Lead scoring, priority management, automated workflows
        `,
        'lead-analysis': `
LEAD ANALYSIS TAB:
- Advanced lead analytics and reporting
- Performance metrics, conversion tracking, quality assessment
- Available Actions: Generate Reports, Analyze Trends, Quality Scoring
- Features: Predictive analytics, lead quality scoring, conversion optimization
        `,
        'duplicates': `
DUPLICATE ANALYSIS TAB:
- Duplicate lead detection and management
- Merge suggestions, data cleansing tools
- Available Actions: Merge Duplicates, Review Matches, Export Clean Data
- Features: Smart duplicate detection, automated merging, data quality tools
        `,
        'reports': `
EXPORT/REPORTS TAB:
- Comprehensive reporting and data export tools
- Custom report generation, scheduled reports
- Available Actions: Generate Report, Schedule Export, Custom Queries
- Features: Automated reporting, data visualization, export formats
        `
      },
      'page-builder': {
        'landing-pages': `
LANDING PAGES TAB:
- Visual page builder for creating high-converting landing pages
- Template library, drag-drop editor, mobile optimization
- Available Actions: Create Page, Edit Template, Publish Page, A/B Test
- Features: WYSIWYG editor, conversion optimization, mobile responsive
        `,
        'forms': `
FORMS TAB:
- Advanced form builder with conditional logic
- Lead capture optimization, form analytics
- Available Actions: Create Form, Edit Fields, View Submissions, Optimize
- Features: Conditional fields, form analytics, conversion tracking
        `,
        'templates': `
TEMPLATES TAB:
- Pre-built templates for various industries and use cases
- Template customization, brand alignment tools
- Available Actions: Browse Templates, Customize Design, Save Template
- Features: Industry templates, brand customization, responsive design
        `,
        'ab-testing': `
A/B TESTING TAB:
- Split testing for pages, forms, and elements
- Statistical significance testing, winner determination
- Available Actions: Create Test, View Results, Implement Winner
- Features: Statistical analysis, automatic winner selection, conversion optimization
        `
      }
    };

    return sectionMap[category]?.[tab] || 'Section details not available';
  };

  return (
    <AdminContext.Provider value={{ state, updateContext, getContextForAI }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminContextProvider');
  }
  return context;
};