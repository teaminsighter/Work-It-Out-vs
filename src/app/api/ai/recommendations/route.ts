import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    const recommendations = await prisma.aIRecommendation.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { confidence: 'desc' },
        { generatedAt: 'desc' }
      ]
    });

    const formattedRecommendations = recommendations.map(rec => ({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      priority: rec.priority,
      impact: rec.impact,
      effort: rec.effort,
      confidence: rec.confidence,
      estimatedValue: rec.estimatedValue,
      timeframe: rec.timeframe,
      status: rec.status,
      generatedAt: rec.generatedAt.toISOString(),
      implementedAt: rec.implementedAt?.toISOString(),
      insights: Array.isArray(rec.insights) ? rec.insights : [],
      metrics: Array.isArray(rec.metrics) ? rec.metrics : [],
      aiReasoning: rec.aiReasoning
    }));

    return NextResponse.json(formattedRecommendations);

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'generate') {
      return await generateRecommendations();
    } else if (action === 'update_status') {
      return await updateRecommendationStatus(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use generate or update_status' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in recommendations POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function generateRecommendations() {
  try {
    // Clear old recommendations that are more than 30 days old
    await prisma.aIRecommendation.deleteMany({
      where: {
        generatedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        status: { in: ['dismissed', 'completed'] }
      }
    });

    const recommendations = await analyzeAndCreateRecommendations();
    
    const createdRecommendations = await Promise.all(
      recommendations.map(rec => 
        prisma.aIRecommendation.create({ data: rec })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${createdRecommendations.length} new recommendations`,
      count: createdRecommendations.length
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

async function updateRecommendationStatus(data: any) {
  const { id, status } = data;

  if (!id || !status) {
    return NextResponse.json(
      { error: 'ID and status are required' },
      { status: 400 }
    );
  }

  const updateData: any = { status };
  
  if (status === 'completed' || status === 'in-progress') {
    updateData.implementedAt = new Date();
  }

  const recommendation = await prisma.aIRecommendation.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json({
    success: true,
    message: 'Recommendation status updated',
    data: recommendation
  });
}

async function analyzeAndCreateRecommendations() {
  const recommendations = [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Analyze conversion rates
  const conversionAnalysis = await analyzeConversionRates(thirtyDaysAgo);
  if (conversionAnalysis) {
    recommendations.push(conversionAnalysis);
  }

  // Analyze lead sources
  const sourceAnalysis = await analyzeLeadSources(thirtyDaysAgo);
  if (sourceAnalysis) {
    recommendations.push(sourceAnalysis);
  }

  // Analyze duplicate leads
  const duplicateAnalysis = await analyzeDuplicateLeads(sevenDaysAgo);
  if (duplicateAnalysis) {
    recommendations.push(duplicateAnalysis);
  }

  // Analyze geographic distribution
  const geoAnalysis = await analyzeGeographicDistribution(thirtyDaysAgo);
  if (geoAnalysis) {
    recommendations.push(geoAnalysis);
  }

  // Analyze lead value optimization
  const valueAnalysis = await analyzeLeadValueOptimization(thirtyDaysAgo);
  if (valueAnalysis) {
    recommendations.push(valueAnalysis);
  }

  return recommendations;
}

async function analyzeConversionRates(since: Date) {
  const [totalVisitors, totalLeads] = await Promise.all([
    prisma.visitor.count({ where: { timestamp: { gte: since } } }),
    prisma.lead.count({ where: { createdAt: { gte: since } } })
  ]);

  const conversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;
  
  if (conversionRate < 2.5) {
    return {
      title: 'Improve Overall Conversion Rate',
      description: 'Your conversion rate is below industry average and could be significantly improved',
      category: 'conversion',
      priority: 'high',
      impact: 'high',
      effort: 'medium',
      confidence: 85,
      estimatedValue: Math.round(totalVisitors * 0.02 * 5000), // Estimate 2% improvement worth €5k per lead
      timeframe: '2-4 weeks',
      status: 'new',
      insights: [
        `Current conversion rate: ${conversionRate.toFixed(2)}%`,
        `Industry average is typically 3-5%`,
        `${totalVisitors} visitors in last 30 days`,
        'Small improvements can yield significant results'
      ],
      metrics: ['Conversion Rate', 'Landing Page Performance', 'Form Completion'],
      aiReasoning: `With ${totalVisitors.toLocaleString()} visitors and only ${totalLeads} leads (${conversionRate.toFixed(2)}% conversion), there's significant room for improvement. Optimizing forms, improving value propositions, and A/B testing landing pages could increase conversions by 1-2%.`
    };
  }
  
  return null;
}

async function analyzeLeadSources(since: Date) {
  const sources = await prisma.lead.groupBy({
    by: ['source'],
    _count: { id: true },
    _avg: { estimatedValue: true },
    where: { createdAt: { gte: since } }
  });

  if (sources.length === 0) return null;

  const topSource = sources.reduce((prev, current) => 
    (prev._count.id > current._count.id) ? prev : current
  );

  const totalLeads = sources.reduce((sum, s) => sum + s._count.id, 0);
  const topSourcePercentage = (topSource._count.id / totalLeads) * 100;

  if (topSourcePercentage > 60) {
    return {
      title: 'Diversify Lead Sources',
      description: 'Heavy reliance on a single lead source creates vulnerability and limits growth potential',
      category: 'marketing',
      priority: 'medium',
      impact: 'medium',
      effort: 'medium',
      confidence: 78,
      estimatedValue: Math.round(totalLeads * 0.3 * 4000),
      timeframe: '4-6 weeks',
      status: 'new',
      insights: [
        `${topSource.source || 'Direct'} accounts for ${topSourcePercentage.toFixed(1)}% of leads`,
        'High dependency on single source is risky',
        'Diversification can increase overall lead volume',
        'Multiple channels provide better market coverage'
      ],
      metrics: ['Source Distribution', 'Channel Performance', 'Lead Volume'],
      aiReasoning: `Your lead generation is heavily dependent on ${topSource.source || 'Direct'} (${topSourcePercentage.toFixed(1)}% of total). Diversifying into 2-3 additional strong channels could increase total volume by 30-40% while reducing risk.`
    };
  }

  const lowValueSources = sources.filter(s => 
    s._avg.estimatedValue && s._avg.estimatedValue < 3000 && s._count.id > 5
  );

  if (lowValueSources.length > 0) {
    return {
      title: 'Optimize Low-Value Lead Sources',
      description: 'Some lead sources are generating high volume but lower value leads',
      category: 'optimization',
      priority: 'medium',
      impact: 'medium',
      effort: 'low',
      confidence: 82,
      estimatedValue: Math.round(lowValueSources.reduce((sum, s) => sum + s._count.id, 0) * 1500),
      timeframe: '2-3 weeks',
      status: 'new',
      insights: [
        `${lowValueSources.length} sources have below-average lead value`,
        'Focus on lead quality over quantity',
        'Optimize targeting and messaging',
        'Consider qualification improvements'
      ],
      metrics: ['Lead Value', 'Source Quality', 'Conversion Rate'],
      aiReasoning: `Sources like ${lowValueSources[0]?.source || 'certain channels'} are generating leads with lower estimated values. Improving targeting and qualification could increase lead value by 25-40%.`
    };
  }

  return null;
}

async function analyzeDuplicateLeads(since: Date) {
  const duplicates = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count
    FROM "Lead"
    WHERE email IS NOT NULL
    AND "createdAt" >= ${since}
    GROUP BY email
    HAVING COUNT(*) > 1
  ` as Array<{ email: string; count: bigint }>;

  if (duplicates.length > 10) {
    const totalDuplicates = duplicates.reduce((sum, dup) => sum + Number(dup.count), 0);
    
    return {
      title: 'Implement Lead Deduplication System',
      description: 'Multiple duplicate leads are affecting data quality and potentially customer experience',
      category: 'optimization',
      priority: 'high',
      impact: 'medium',
      effort: 'low',
      confidence: 92,
      estimatedValue: Math.round(duplicates.length * 500), // Cost savings from better data quality
      timeframe: '1-2 weeks',
      status: 'new',
      insights: [
        `${duplicates.length} duplicate email addresses found`,
        `${totalDuplicates} total duplicate entries`,
        'Poor data quality affects decision making',
        'Automated deduplication can prevent issues'
      ],
      metrics: ['Data Quality', 'Lead Processing', 'Customer Experience'],
      aiReasoning: `With ${duplicates.length} duplicate email addresses in the last week, implementing email validation and deduplication rules is critical. This will improve data quality and prevent customer frustration from duplicate communications.`
    };
  }

  return null;
}

async function analyzeGeographicDistribution(since: Date) {
  const locations = await prisma.lead.groupBy({
    by: ['city'],
    _count: { id: true },
    where: { 
      createdAt: { gte: since },
      city: { not: null }
    }
  });

  if (locations.length === 0) return null;

  const totalLeads = locations.reduce((sum, l) => sum + l._count.id, 0);
  const topLocation = locations.reduce((prev, current) => 
    (prev._count.id > current._count.id) ? prev : current
  );

  const coverage = locations.length;
  
  if (coverage < 5) {
    return {
      title: 'Expand Geographic Market Coverage',
      description: 'Limited geographic coverage suggests untapped market opportunities',
      category: 'growth',
      priority: 'medium',
      impact: 'high',
      effort: 'medium',
      confidence: 75,
      estimatedValue: Math.round(totalLeads * 0.5 * 4500),
      timeframe: '6-8 weeks',
      status: 'new',
      insights: [
        `Only ${coverage} locations generating significant leads`,
        `${topLocation.city} dominates with ${topLocation._count.id} leads`,
        'Potential for geographic expansion',
        'Local marketing could unlock new markets'
      ],
      metrics: ['Geographic Coverage', 'Market Penetration', 'Lead Distribution'],
      aiReasoning: `Your leads are concentrated in only ${coverage} main locations, with ${topLocation.city} leading. Expanding marketing to 3-5 additional strategic locations could increase lead volume by 40-60%.`
    };
  }

  return null;
}

async function analyzeLeadValueOptimization(since: Date) {
  const leadValues = await prisma.lead.findMany({
    where: { 
      createdAt: { gte: since },
      estimatedValue: { not: null }
    },
    select: { estimatedValue: true, source: true }
  });

  if (leadValues.length === 0) return null;

  const avgValue = leadValues.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) / leadValues.length;
  const lowValueLeads = leadValues.filter(l => (l.estimatedValue || 0) < avgValue * 0.6);

  if (lowValueLeads.length > leadValues.length * 0.3) {
    return {
      title: 'Optimize Lead Qualification Process',
      description: 'A significant portion of leads have below-average estimated values',
      category: 'optimization',
      priority: 'medium',
      impact: 'high',
      effort: 'medium',
      confidence: 80,
      estimatedValue: Math.round(lowValueLeads.length * 2000),
      timeframe: '3-4 weeks',
      status: 'new',
      insights: [
        `${lowValueLeads.length} leads below average value`,
        `Average lead value: €${avgValue.toFixed(0)}`,
        'Better qualification can increase lead value',
        'Focus on high-intent prospects'
      ],
      metrics: ['Lead Value', 'Qualification Score', 'Conversion Quality'],
      aiReasoning: `${((lowValueLeads.length / leadValues.length) * 100).toFixed(1)}% of leads are significantly below average value. Implementing better qualification questions and lead scoring could increase average lead value by 25-35%.`
    };
  }

  return null;
}