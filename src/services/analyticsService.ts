// Mock Analytics Service for Admin Panel
export interface AnalyticsData {
  views: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  campaigns: Campaign[];
  performance: PerformanceMetric[];
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  status: 'active' | 'paused' | 'ended';
}

export interface PerformanceMetric {
  date: string;
  views: number;
  conversions: number;
  revenue: number;
}

export interface FunnelData {
  step: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface AddressAnalytics {
  topCities: Array<{
    city: string;
    leads: number;
    conversionRate: number;
  }>;
  topRegions: Array<{
    region: string;
    leads: number;
    conversionRate: number;
  }>;
  totalAddresses: number;
  averageConversionByLocation: number;
}

class AnalyticsService {
  // Mock data for demonstration
  private mockCampaigns: Campaign[] = [
    {
      id: '1',
      name: 'Google Ads - Health Insurance',
      platform: 'Google Ads',
      spend: 1250.00,
      impressions: 45680,
      clicks: 892,
      conversions: 23,
      ctr: 1.95,
      cpc: 1.40,
      roas: 4.2,
      status: 'active'
    },
    {
      id: '2',
      name: 'Facebook - Life Insurance',
      platform: 'Facebook',
      spend: 980.00,
      impressions: 35420,
      clicks: 654,
      conversions: 18,
      ctr: 1.85,
      cpc: 1.50,
      roas: 3.8,
      status: 'active'
    },
    {
      id: '3',
      name: 'LinkedIn - Income Protection',
      platform: 'LinkedIn',
      spend: 750.00,
      impressions: 12340,
      clicks: 234,
      conversions: 8,
      ctr: 1.90,
      cpc: 3.21,
      roas: 3.2,
      status: 'paused'
    }
  ];

  private mockPerformance: PerformanceMetric[] = [
    { date: '2024-09-22', views: 1420, conversions: 52, revenue: 15600 },
    { date: '2024-09-23', views: 1680, conversions: 61, revenue: 18300 },
    { date: '2024-09-24', views: 1390, conversions: 48, revenue: 14400 },
    { date: '2024-09-25', views: 1850, conversions: 73, revenue: 21900 },
    { date: '2024-09-26', views: 1920, conversions: 67, revenue: 20100 },
    { date: '2024-09-27', views: 1760, conversions: 59, revenue: 17700 },
    { date: '2024-09-28', views: 1650, conversions: 55, revenue: 16500 }
  ];

  async getAnalyticsOverview(): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalViews = this.mockPerformance.reduce((sum, day) => sum + day.views, 0);
    const totalConversions = this.mockPerformance.reduce((sum, day) => sum + day.conversions, 0);
    const totalRevenue = this.mockPerformance.reduce((sum, day) => sum + day.revenue, 0);

    return {
      views: totalViews,
      conversions: totalConversions,
      conversionRate: (totalConversions / totalViews) * 100,
      revenue: totalRevenue,
      campaigns: this.mockCampaigns,
      performance: this.mockPerformance
    };
  }

  async getCampaigns(): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockCampaigns;
  }

  async getPerformanceData(days: number = 7): Promise<PerformanceMetric[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.mockPerformance.slice(-days);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const campaignIndex = this.mockCampaigns.findIndex(c => c.id === id);
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    this.mockCampaigns[campaignIndex] = { ...this.mockCampaigns[campaignIndex], ...updates };
    return this.mockCampaigns[campaignIndex];
  }

  async createCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      ...campaign
    };

    this.mockCampaigns.push(newCampaign);
    return newCampaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Campaign not found');
    }

    this.mockCampaigns.splice(index, 1);
  }

  // Real-time tracking methods
  async trackPageView(pageId: string): Promise<void> {
    // In a real implementation, this would send data to analytics service
    console.log(`Page view tracked for: ${pageId}`);
  }

  async trackConversion(pageId: string, value?: number): Promise<void> {
    // In a real implementation, this would send conversion data
    console.log(`Conversion tracked for: ${pageId}`, value ? `Value: $${value}` : '');
  }

  // Lead analytics
  async getLeadAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      totalLeads: 1247,
      qualifiedLeads: 892,
      conversionRate: 71.5,
      averageValue: 1850,
      leadSources: [
        { source: 'Google Ads', leads: 445, percentage: 35.7 },
        { source: 'Facebook', leads: 312, percentage: 25.0 },
        { source: 'Organic Search', leads: 298, percentage: 23.9 },
        { source: 'Direct', leads: 142, percentage: 11.4 },
        { source: 'Referral', leads: 50, percentage: 4.0 }
      ],
      leadsByPage: [
        { page: 'Main (/)', leads: 385, conversionRate: 4.2 },
        { page: 'Health (/health)', leads: 298, conversionRate: 5.1 },
        { page: 'Life (/life)', leads: 267, conversionRate: 3.8 },
        { page: 'Income (/income)', leads: 108, conversionRate: 3.2 },
        { page: 'New (/new)', leads: 45, conversionRate: 2.8 }
      ]
    };
  }

  // Funnel analytics
  async getFunnelData(): Promise<FunnelData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { step: 'Landing Page', visitors: 10000, conversions: 7500, conversionRate: 75, dropoffRate: 25 },
      { step: 'Quote Form', visitors: 7500, conversions: 3200, conversionRate: 42.7, dropoffRate: 57.3 },
      { step: 'Personal Details', visitors: 3200, conversions: 2800, conversionRate: 87.5, dropoffRate: 12.5 },
      { step: 'Contact Info', visitors: 2800, conversions: 2400, conversionRate: 85.7, dropoffRate: 14.3 },
      { step: 'Submission', visitors: 2400, conversions: 2100, conversionRate: 87.5, dropoffRate: 12.5 }
    ];
  }

  // Address analytics
  async getAddressAnalytics(): Promise<AddressAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    return {
      topCities: [
        { city: 'Auckland', leads: 425, conversionRate: 4.8 },
        { city: 'Wellington', leads: 312, conversionRate: 5.2 },
        { city: 'Christchurch', leads: 267, conversionRate: 4.1 },
        { city: 'Hamilton', leads: 189, conversionRate: 3.9 },
        { city: 'Tauranga', leads: 156, conversionRate: 4.5 }
      ],
      topRegions: [
        { region: 'Auckland', leads: 567, conversionRate: 4.7 },
        { region: 'Wellington', leads: 389, conversionRate: 5.0 },
        { region: 'Canterbury', leads: 334, conversionRate: 4.2 },
        { region: 'Waikato', leads: 245, conversionRate: 4.0 },
        { region: 'Bay of Plenty', leads: 198, conversionRate: 4.3 }
      ],
      totalAddresses: 1847,
      averageConversionByLocation: 4.4
    };
  }
}

export const analyticsService = new AnalyticsService();