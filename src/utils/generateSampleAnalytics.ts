// Utility functions for analytics data processing
export function generateDateRange(days: number = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

export function calculateMetrics(data: any[]) {
  if (!data.length) {
    return {
      views: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0
    };
  }

  return data.reduce((acc, item) => ({
    views: acc.views + (item.views || 0),
    clicks: acc.clicks + (item.clicks || 0),
    conversions: acc.conversions + (item.conversions || 0),
    revenue: acc.revenue + (item.revenue || 0)
  }), { views: 0, clicks: 0, conversions: 0, revenue: 0 });
}