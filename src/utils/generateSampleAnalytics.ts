// Utility functions for generating sample analytics data
export function generateSampleAnalyticsData() {
  // Generate sample funnel data
  const funnelSteps = [
    'Landing Page View',
    'Start Quote',
    'Personal Details',
    'Contact Information',
    'Quote Generated',
    'Lead Submitted'
  ];

  let visitors = 10000;
  const funnelData = funnelSteps.map((step, index) => {
    const dropRate = Math.random() * 0.3 + 0.1; // 10-40% drop rate
    const conversions = Math.floor(visitors * (1 - dropRate));
    const conversionRate = (conversions / visitors) * 100;
    
    const data = {
      step,
      visitors,
      conversions,
      conversionRate: Math.round(conversionRate * 10) / 10,
      dropoffRate: Math.round(dropRate * 100 * 10) / 10
    };
    
    visitors = conversions; // Next step's visitors are this step's conversions
    return data;
  });

  // Generate address analytics
  const cities = [
    'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 
    'Tauranga', 'Dunedin', 'Palmerston North', 'Rotorua'
  ];
  
  const addressData = {
    topCities: cities.slice(0, 5).map(city => ({
      city,
      leads: Math.floor(Math.random() * 500) + 100,
      conversionRate: Math.round((Math.random() * 3 + 2) * 10) / 10
    })),
    topRegions: [
      'Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty'
    ].map(region => ({
      region,
      leads: Math.floor(Math.random() * 600) + 150,
      conversionRate: Math.round((Math.random() * 3 + 2.5) * 10) / 10
    })),
    totalAddresses: Math.floor(Math.random() * 2000) + 1000,
    averageConversionByLocation: Math.round((Math.random() * 2 + 3) * 10) / 10
  };

  return {
    funnelData,
    addressData,
    generatedAt: new Date().toISOString()
  };
}

export function clearAnalyticsData() {
  // In a real implementation, this would clear the analytics data
  console.log('Analytics data cleared');
  return {
    success: true,
    message: 'Analytics data has been cleared'
  };
}

export function generateDateRange(days: number = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

export function generateRandomMetrics() {
  return {
    views: Math.floor(Math.random() * 10000) + 1000,
    clicks: Math.floor(Math.random() * 1000) + 100,
    conversions: Math.floor(Math.random() * 100) + 10,
    revenue: Math.floor(Math.random() * 50000) + 5000
  };
}