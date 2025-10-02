import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'alerts';
    
    if (type === 'rules') {
      return await getAlertRules();
    } else if (type === 'metrics') {
      return await getAlertMetrics();
    } else {
      return await getAlerts(searchParams);
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create_rule') {
      return await createAlertRule(data);
    } else if (action === 'update_alert') {
      return await updateAlert(data);
    } else if (action === 'check_alerts') {
      return await checkAndCreateAlerts();
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in alerts POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function getAlerts(searchParams: URLSearchParams) {
  const severity = searchParams.get('severity');
  const category = searchParams.get('category');
  const showResolved = searchParams.get('showResolved') === 'true';
  
  const where: any = {};
  
  if (severity && severity !== 'all') {
    where.severity = severity;
  }
  
  if (category && category !== 'all') {
    where.category = category;
  }
  
  if (!showResolved) {
    where.status = { not: 'resolved' };
  }

  const alerts = await prisma.aIAlert.findMany({
    where,
    orderBy: [
      { severity: 'desc' },
      { triggeredAt: 'desc' }
    ]
  });

  const formattedAlerts = alerts.map(alert => ({
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severity: alert.severity,
    category: alert.category,
    metric: alert.metric,
    currentValue: alert.currentValue,
    threshold: alert.threshold,
    previousValue: alert.previousValue,
    change: alert.change,
    changePercent: alert.changePercent,
    triggeredAt: alert.triggeredAt.toISOString(),
    status: alert.status,
    isRead: alert.isRead,
    recommendedAction: alert.recommendedAction,
    affectedPages: Array.isArray(alert.affectedPages) ? alert.affectedPages : [],
    estimatedImpact: alert.estimatedImpact,
    resolvedAt: alert.resolvedAt?.toISOString()
  }));

  return NextResponse.json(formattedAlerts);
}

async function getAlertRules() {
  const rules = await prisma.aIAlertRule.findMany({
    orderBy: { updatedAt: 'desc' }
  });

  const formattedRules = rules.map(rule => ({
    id: rule.id.toString(),
    name: rule.name,
    metric: rule.metric,
    condition: rule.condition,
    threshold: rule.threshold,
    timeframe: rule.timeframe,
    enabled: rule.enabled,
    severity: rule.severity,
    notifications: rule.notifications,
    emailRecipients: Array.isArray(rule.emailRecipients) ? rule.emailRecipients : []
  }));

  return NextResponse.json(formattedRules);
}

async function getAlertMetrics() {
  const [totalAlerts, criticalAlerts, unreadAlerts, recentAlerts] = await Promise.all([
    prisma.aIAlert.count(),
    prisma.aIAlert.count({ where: { severity: 'critical' } }),
    prisma.aIAlert.count({ where: { isRead: false } }),
    prisma.aIAlert.count({
      where: {
        triggeredAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  // Calculate average resolution time
  const resolvedAlerts = await prisma.aIAlert.findMany({
    where: {
      status: 'resolved',
      resolvedAt: { not: null }
    },
    select: {
      triggeredAt: true,
      resolvedAt: true
    }
  });

  let avgResolutionTime = '0 hours';
  if (resolvedAlerts.length > 0) {
    const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
      const resolutionTime = alert.resolvedAt!.getTime() - alert.triggeredAt.getTime();
      return sum + resolutionTime;
    }, 0);
    
    const avgMinutes = totalResolutionTime / (resolvedAlerts.length * 60 * 1000);
    if (avgMinutes < 60) {
      avgResolutionTime = `${Math.round(avgMinutes)} minutes`;
    } else {
      avgResolutionTime = `${(avgMinutes / 60).toFixed(1)} hours`;
    }
  }

  const metrics = {
    totalAlerts,
    criticalAlerts,
    unreadAlerts,
    avgResolutionTime,
    alertsToday: recentAlerts,
    alertsTrend: -12 // Placeholder - would need historical data for real trend
  };

  return NextResponse.json(metrics);
}

async function createAlertRule(data: any) {
  const {
    name,
    metric,
    condition,
    threshold,
    timeframe,
    severity,
    notifications = false,
    emailRecipients = []
  } = data;

  if (!name || !metric || !condition || threshold === undefined) {
    return NextResponse.json(
      { error: 'Name, metric, condition, and threshold are required' },
      { status: 400 }
    );
  }

  const rule = await prisma.aIAlertRule.create({
    data: {
      name,
      metric,
      condition,
      threshold,
      timeframe,
      severity,
      notifications,
      emailRecipients
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Alert rule created successfully',
    data: rule
  });
}

async function updateAlert(data: any) {
  const { id, status, isRead } = data;

  if (!id) {
    return NextResponse.json(
      { error: 'Alert ID is required' },
      { status: 400 }
    );
  }

  const updateData: any = {};
  
  if (status !== undefined) {
    updateData.status = status;
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
  }
  
  if (isRead !== undefined) {
    updateData.isRead = isRead;
  }

  const alert = await prisma.aIAlert.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json({
    success: true,
    message: 'Alert updated successfully',
    data: alert
  });
}

async function checkAndCreateAlerts() {
  const alerts = [];
  
  // Check conversion rate alerts
  const conversionAlert = await checkConversionRate();
  if (conversionAlert) alerts.push(conversionAlert);
  
  // Check traffic alerts
  const trafficAlert = await checkTrafficLevels();
  if (trafficAlert) alerts.push(trafficAlert);
  
  // Check lead volume alerts
  const leadVolumeAlert = await checkLeadVolume();
  if (leadVolumeAlert) alerts.push(leadVolumeAlert);
  
  // Check data quality alerts
  const dataQualityAlert = await checkDataQuality();
  if (dataQualityAlert) alerts.push(dataQualityAlert);

  // Create alerts in database
  const createdAlerts = [];
  for (const alertData of alerts) {
    try {
      const alert = await prisma.aIAlert.create({ data: alertData });
      createdAlerts.push(alert);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  return NextResponse.json({
    success: true,
    message: `Created ${createdAlerts.length} new alerts`,
    count: createdAlerts.length
  });
}

async function checkConversionRate() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fourtyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [recentVisitors, recentLeads, previousVisitors, previousLeads] = await Promise.all([
    prisma.visitor.count({ where: { timestamp: { gte: twentyFourHoursAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
    prisma.visitor.count({ 
      where: { 
        timestamp: { 
          gte: fourtyEightHoursAgo,
          lt: twentyFourHoursAgo
        } 
      } 
    }),
    prisma.lead.count({ 
      where: { 
        createdAt: { 
          gte: fourtyEightHoursAgo,
          lt: twentyFourHoursAgo
        } 
      } 
    })
  ]);

  const currentRate = recentVisitors > 0 ? (recentLeads / recentVisitors) * 100 : 0;
  const previousRate = previousVisitors > 0 ? (previousLeads / previousVisitors) * 100 : 0;
  const change = currentRate - previousRate;
  const changePercent = previousRate > 0 ? ((change / previousRate) * 100) : 0;

  // Alert if conversion rate drops below 2% or drops by more than 30%
  if (currentRate < 2.0 || (changePercent < -30 && previousRate > 1)) {
    return {
      title: currentRate < 2.0 ? 'Low Conversion Rate Detected' : 'Significant Conversion Rate Drop',
      description: `Conversion rate ${currentRate < 2.0 ? 'is below 2%' : 'has dropped significantly'} in the last 24 hours`,
      severity: currentRate < 1.0 || changePercent < -50 ? 'critical' : 'warning',
      category: 'conversion',
      metric: 'Conversion Rate',
      currentValue: currentRate,
      threshold: 2.0,
      previousValue: previousRate,
      change,
      changePercent,
      recommendedAction: 'Review recent changes to landing pages, check form functionality, verify tracking implementation, and analyze traffic quality',
      affectedPages: ['All landing pages', 'Lead forms'],
      estimatedImpact: `Potential revenue loss: €${Math.round(recentVisitors * 0.02 * 4000).toLocaleString()}/day`
    };
  }

  return null;
}

async function checkTrafficLevels() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [recentTraffic, previousWeekTraffic] = await Promise.all([
    prisma.visitor.count({ where: { timestamp: { gte: twentyFourHoursAgo } } }),
    prisma.visitor.count({ 
      where: { 
        timestamp: { 
          gte: twoWeeksAgo,
          lt: weekAgo
        } 
      } 
    })
  ]);

  const avgPreviousTraffic = previousWeekTraffic / 7; // Daily average from previous week
  const changePercent = avgPreviousTraffic > 0 ? ((recentTraffic - avgPreviousTraffic) / avgPreviousTraffic) * 100 : 0;

  // Alert if traffic drops by more than 40%
  if (changePercent < -40 && avgPreviousTraffic > 10) {
    return {
      title: 'Significant Traffic Drop Detected',
      description: `Website traffic has decreased by ${Math.abs(changePercent).toFixed(1)}% compared to previous week average`,
      severity: changePercent < -60 ? 'critical' : 'warning',
      category: 'traffic',
      metric: 'Daily Visitors',
      currentValue: recentTraffic,
      threshold: avgPreviousTraffic * 0.6, // 40% drop threshold
      previousValue: avgPreviousTraffic,
      change: recentTraffic - avgPreviousTraffic,
      changePercent,
      recommendedAction: 'Check ad campaigns, verify website functionality, review SEO rankings, and analyze traffic sources',
      affectedPages: ['All pages'],
      estimatedImpact: 'Reduced lead generation and brand visibility'
    };
  }

  return null;
}

async function checkLeadVolume() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [recentLeads, previousWeekLeads] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
    prisma.lead.count({ 
      where: { 
        createdAt: { 
          gte: twoWeeksAgo,
          lt: weekAgo
        } 
      } 
    })
  ]);

  const avgPreviousLeads = previousWeekLeads / 7;
  const changePercent = avgPreviousLeads > 0 ? ((recentLeads - avgPreviousLeads) / avgPreviousLeads) * 100 : 0;

  // Alert if lead volume drops by more than 50%
  if (changePercent < -50 && avgPreviousLeads > 2) {
    return {
      title: 'Critical Lead Volume Drop',
      description: `Lead generation has decreased by ${Math.abs(changePercent).toFixed(1)}% in the last 24 hours`,
      severity: 'critical',
      category: 'conversion',
      metric: 'Daily Leads',
      currentValue: recentLeads,
      threshold: avgPreviousLeads * 0.5,
      previousValue: avgPreviousLeads,
      change: recentLeads - avgPreviousLeads,
      changePercent,
      recommendedAction: 'Immediately check form functionality, review ad campaigns, verify tracking, and analyze traffic quality',
      affectedPages: ['Lead forms', 'Landing pages'],
      estimatedImpact: `Potential revenue loss: €${Math.round(Math.abs(recentLeads - avgPreviousLeads) * 4000).toLocaleString()}/day`
    };
  }

  return null;
}

async function checkDataQuality() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Check for duplicate leads
  const duplicates = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count
    FROM "Lead"
    WHERE email IS NOT NULL
    AND "createdAt" >= ${weekAgo}
    GROUP BY email
    HAVING COUNT(*) > 1
  ` as Array<{ email: string; count: bigint }>;

  const duplicateCount = duplicates.length;
  const totalLeads = await prisma.lead.count({ 
    where: { createdAt: { gte: weekAgo } } 
  });

  const duplicateRate = totalLeads > 0 ? (duplicateCount / totalLeads) * 100 : 0;

  // Alert if duplicate rate is above 15%
  if (duplicateRate > 15 && duplicateCount > 5) {
    return {
      title: 'High Duplicate Lead Rate Detected',
      description: `${duplicateRate.toFixed(1)}% of recent leads are duplicates, affecting data quality`,
      severity: duplicateRate > 25 ? 'warning' : 'info',
      category: 'system',
      metric: 'Data Quality Score',
      currentValue: 100 - duplicateRate,
      threshold: 85,
      previousValue: 90, // Placeholder
      change: -(duplicateRate - 10),
      changePercent: -((duplicateRate - 10) / 10) * 100,
      recommendedAction: 'Implement email validation, set up duplicate detection rules, and review data entry processes',
      affectedPages: ['Lead forms', 'Data management'],
      estimatedImpact: 'Poor data quality affects decision making and customer experience'
    };
  }

  return null;
}