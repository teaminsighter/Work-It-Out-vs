import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'reports';

    if (type === 'templates') {
      return await getReportTemplates();
    } else if (type === 'history') {
      return await getReportHistory();
    } else {
      return await getReports();
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      return await createReport(data);
    } else if (action === 'generate') {
      return await generateReport(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use create or generate' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in reports POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const report = await prisma.aIReport.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

async function getReports() {
  const reports = await prisma.aIReport.findMany({
    orderBy: { updatedAt: 'desc' }
  });

  const formattedReports = reports.map(report => ({
    id: report.id.toString(),
    name: report.name,
    description: report.description,
    type: report.type,
    frequency: report.frequency,
    recipients: Array.isArray(report.recipients) ? report.recipients : [],
    status: report.status,
    lastGenerated: report.lastGenerated?.toISOString(),
    nextScheduled: report.nextScheduled?.toISOString(),
    metrics: Array.isArray(report.metrics) ? report.metrics : [],
    format: report.format,
    aiInsights: report.aiInsights,
    deliveryCount: report.deliveryCount
  }));

  return NextResponse.json(formattedReports);
}

async function getReportTemplates() {
  // Pre-defined report templates based on available data
  const templates = [
    {
      id: 'template_1',
      name: 'Executive Dashboard',
      category: 'performance',
      description: 'High-level KPIs and trends for executive decision making',
      metrics: ['Lead Volume', 'Conversion Rate', 'Pipeline Value', 'Traffic Sources'],
      aiFeatures: ['Trend Analysis', 'Performance Insights', 'Growth Recommendations'],
      estimatedTime: '5 minutes',
      popularity: 95
    },
    {
      id: 'template_2',
      name: 'Sales Performance Report',
      category: 'leads',
      description: 'Detailed sales metrics and pipeline analysis',
      metrics: ['Lead Quality', 'Source Performance', 'Geographic Distribution', 'Status Tracking'],
      aiFeatures: ['Lead Scoring', 'Source Optimization', 'Performance Recommendations'],
      estimatedTime: '8 minutes',
      popularity: 87
    },
    {
      id: 'template_3',
      name: 'Marketing Analytics',
      category: 'marketing',
      description: 'Campaign performance and traffic analysis',
      metrics: ['Traffic Sources', 'Visitor Behavior', 'Conversion Funnel', 'Page Performance'],
      aiFeatures: ['Traffic Optimization', 'Conversion Insights', 'Channel Recommendations'],
      estimatedTime: '12 minutes',
      popularity: 78
    },
    {
      id: 'template_4',
      name: 'Operational Summary',
      category: 'operational',
      description: 'System performance and operational metrics',
      metrics: ['System Health', 'User Activity', 'Data Quality', 'Performance Metrics'],
      aiFeatures: ['Anomaly Detection', 'Performance Optimization', 'System Health Score'],
      estimatedTime: '6 minutes',
      popularity: 82
    }
  ];

  return NextResponse.json(templates);
}

async function getReportHistory() {
  // Get recent report generation history
  const reports = await prisma.aIReport.findMany({
    where: {
      lastGenerated: {
        not: null
      }
    },
    orderBy: { lastGenerated: 'desc' },
    take: 20
  });

  const history = reports.map(report => ({
    id: `hist_${report.id}`,
    reportName: report.name,
    generatedAt: report.lastGenerated?.toISOString(),
    deliveredTo: Array.isArray(report.recipients) ? report.recipients.length : 0,
    status: report.lastGenerated ? 'delivered' : 'failed',
    insights: Math.floor(Math.random() * 15) + 5, // Placeholder for AI insights count
    fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`
  }));

  return NextResponse.json(history);
}

async function createReport(data: any) {
  const {
    name,
    description,
    type,
    frequency,
    recipients = [],
    metrics = [],
    format = 'pdf',
    aiInsights = true
  } = data;

  if (!name || !type) {
    return NextResponse.json(
      { error: 'Name and type are required' },
      { status: 400 }
    );
  }

  // Calculate next scheduled time based on frequency
  const nextScheduled = calculateNextScheduled(frequency);

  const report = await prisma.aIReport.create({
    data: {
      name,
      description,
      type,
      frequency,
      recipients,
      metrics,
      format,
      aiInsights,
      status: 'active',
      nextScheduled
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Report created successfully',
    data: {
      id: report.id.toString(),
      name: report.name,
      status: report.status
    }
  });
}

async function generateReport(data: any) {
  const { reportId, templateId } = data;

  if (!reportId && !templateId) {
    return NextResponse.json(
      { error: 'Report ID or template ID is required' },
      { status: 400 }
    );
  }

  let report;
  if (reportId) {
    report = await prisma.aIReport.findUnique({
      where: { id: parseInt(reportId) }
    });
  }

  if (!report && templateId) {
    // Generate report from template
    const reportData = await generateReportFromTemplate(templateId);
    
    return NextResponse.json({
      success: true,
      message: 'Report generated from template',
      data: reportData
    });
  }

  if (!report) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }

  // Generate actual report data
  const reportData = await generateActualReport(report);

  // Update last generated timestamp
  await prisma.aIReport.update({
    where: { id: report.id },
    data: {
      lastGenerated: new Date(),
      deliveryCount: { increment: 1 },
      nextScheduled: calculateNextScheduled(report.frequency)
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Report generated successfully',
    data: reportData
  });
}

async function generateReportFromTemplate(templateId: string) {
  // Generate report based on template
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const endDate = new Date();

  const [leadCount, visitorCount, totalValue] = await Promise.all([
    prisma.lead.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    }),
    prisma.visitor.count({
      where: { timestamp: { gte: startDate, lte: endDate } }
    }),
    prisma.lead.aggregate({
      where: { createdAt: { gte: startDate, lte: endDate } },
      _sum: { estimatedValue: true }
    })
  ]);

  const conversionRate = visitorCount > 0 ? (leadCount / visitorCount) * 100 : 0;

  return {
    templateId,
    period: `${startDate.toDateString()} - ${endDate.toDateString()}`,
    metrics: {
      leadCount,
      visitorCount,
      conversionRate: conversionRate.toFixed(2),
      totalValue: totalValue._sum.estimatedValue || 0
    },
    insights: [
      `Generated ${leadCount} leads from ${visitorCount} visitors`,
      `Conversion rate: ${conversionRate.toFixed(2)}%`,
      `Total pipeline value: €${(totalValue._sum.estimatedValue || 0).toLocaleString()}`
    ],
    generatedAt: new Date().toISOString()
  };
}

async function generateActualReport(report: any) {
  const metrics = Array.isArray(report.metrics) ? report.metrics : [];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const reportData: any = {
    id: report.id,
    name: report.name,
    period: `${startDate.toDateString()} - ${endDate.toDateString()}`,
    generatedAt: new Date().toISOString(),
    metrics: {},
    insights: []
  };

  // Generate metrics based on what's requested
  if (metrics.includes('Lead Volume') || metrics.includes('Leads')) {
    const leadCount = await prisma.lead.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    });
    reportData.metrics.leadVolume = leadCount;
    reportData.insights.push(`Generated ${leadCount} leads in the reporting period`);
  }

  if (metrics.includes('Conversion Rate')) {
    const [leadCount, visitorCount] = await Promise.all([
      prisma.lead.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.visitor.count({
        where: { timestamp: { gte: startDate, lte: endDate } }
      })
    ]);
    
    const conversionRate = visitorCount > 0 ? (leadCount / visitorCount) * 100 : 0;
    reportData.metrics.conversionRate = conversionRate.toFixed(2);
    reportData.insights.push(`Conversion rate: ${conversionRate.toFixed(2)}%`);
  }

  if (metrics.includes('Pipeline Value') || metrics.includes('Value')) {
    const totalValue = await prisma.lead.aggregate({
      where: { createdAt: { gte: startDate, lte: endDate } },
      _sum: { estimatedValue: true }
    });
    
    reportData.metrics.pipelineValue = totalValue._sum.estimatedValue || 0;
    reportData.insights.push(`Total pipeline value: €${(totalValue._sum.estimatedValue || 0).toLocaleString()}`);
  }

  if (metrics.includes('Traffic Sources') || metrics.includes('Sources')) {
    const sources = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
      where: { createdAt: { gte: startDate, lte: endDate } }
    });
    
    reportData.metrics.topSources = sources.slice(0, 5);
    reportData.insights.push(`Top performing source: ${sources[0]?.source || 'Direct'} with ${sources[0]?._count.id || 0} leads`);
  }

  return reportData;
}

function calculateNextScheduled(frequency: string | null): Date | null {
  if (!frequency) return null;

  const now = new Date();
  
  if (frequency.includes('weekly') || frequency.includes('Monday')) {
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
    nextMonday.setHours(9, 0, 0, 0);
    return nextMonday;
  }
  
  if (frequency.includes('monthly') || frequency.includes('month')) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextMonth.setHours(9, 0, 0, 0);
    return nextMonth;
  }
  
  if (frequency.includes('daily')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }
  
  return null;
}