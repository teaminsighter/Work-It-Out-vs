import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ChatRequest {
  query: string;
  conversationId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { query, conversationId }: ChatRequest = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate AI response based on query analysis
    const response = await generateAIResponse(query);

    // Save conversation to database
    const conversation = await prisma.aIConversation.create({
      data: {
        query: query.trim(),
        response: response.content,
        data: response.data || {},
        chartType: response.chart,
        conversationId: conversationId || `conv_${Date.now()}`,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      id: conversation.id.toString(),
      type: 'ai',
      content: response.content,
      timestamp: conversation.timestamp.toISOString(),
      data: response.data,
      chart: response.chart
    });

  } catch (error) {
    console.error('Error processing chatbot query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '20');

    let conversations;
    
    if (conversationId) {
      conversations = await prisma.aIConversation.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'asc' },
        take: limit
      });
    } else {
      conversations = await prisma.aIConversation.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit
      });
    }

    const formattedConversations = conversations.map(conv => ({
      id: conv.id.toString(),
      type: 'ai',
      content: conv.response,
      timestamp: conv.timestamp.toISOString(),
      data: conv.data,
      chart: conv.chartType,
      query: conv.query
    }));

    return NextResponse.json(formattedConversations);

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

async function generateAIResponse(query: string) {
  const lowerQuery = query.toLowerCase();

  try {
    // Analyze query and fetch real data from database
    if (lowerQuery.includes('leads') && (lowerQuery.includes('facebook') || lowerQuery.includes('fb'))) {
      return await getFacebookLeadsAnalysis();
    } else if (lowerQuery.includes('conversion rate')) {
      return await getConversionRateAnalysis();
    } else if (lowerQuery.includes('duplicate') || lowerQuery.includes('duplicates')) {
      return await getDuplicateLeadsAnalysis();
    } else if (lowerQuery.includes('roi') || lowerQuery.includes('return')) {
      return await getROIAnalysis();
    } else if (lowerQuery.includes('location') || lowerQuery.includes('geographic')) {
      return await getLocationAnalysis();
    } else {
      return await getGeneralAnalysis();
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      content: "I apologize, but I'm having trouble accessing the analytics data right now. Please try again in a moment or contact support if the issue persists.",
      data: null,
      chart: undefined
    };
  }
}

async function getFacebookLeadsAnalysis() {
  const leads = await prisma.lead.findMany({
    where: {
      source: { contains: 'facebook', mode: 'insensitive' },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
  const avgValue = totalLeads > 0 ? totalValue / totalLeads : 0;

  return {
    content: `📊 **Facebook Leads Analysis (Last 30 Days)**\n\n• Total Leads: **${totalLeads} leads**\n• Average Lead Value: **€${avgValue.toFixed(2)}**\n• Total Pipeline Value: **€${totalValue.toLocaleString()}**\n• Status Distribution: Active leads being processed\n\n🎯 **Insights:**\n${totalLeads > 0 ? `• Facebook campaigns are generating ${totalLeads} qualified leads\n• Average deal size is €${avgValue.toFixed(2)}\n• Consider increasing budget allocation if performance is strong` : '• No Facebook leads found in the last 30 days\n• Consider reviewing Facebook ad campaigns\n• Check tracking setup for Facebook traffic'}`,
    data: {
      leads: totalLeads,
      total_value: totalValue,
      avg_value: avgValue
    },
    chart: totalLeads > 0 ? 'bar' : undefined
  };
}

async function getConversionRateAnalysis() {
  const [totalVisitors, totalLeads] = await Promise.all([
    prisma.visitor.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const conversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;

  const sourceAnalysis = await prisma.lead.groupBy({
    by: ['source'],
    _count: { id: true },
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  const sourceStats = sourceAnalysis.map(s => `• ${s.source || 'Direct'}: ${s._count.id} leads`).join('\n');

  return {
    content: `📈 **Conversion Rate Analysis (Last 30 Days)**\n\n• Overall Conversion Rate: **${conversionRate.toFixed(2)}%**\n• Total Visitors: **${totalVisitors.toLocaleString()}**\n• Total Leads: **${totalLeads.toLocaleString()}**\n\n📊 **By Source:**\n${sourceStats}\n\n💡 **Recommendations:**\n${conversionRate > 3 ? '• Strong conversion rate! Consider scaling successful campaigns\n• Monitor performance to maintain quality' : '• Conversion rate could be improved\n• Review landing page optimization\n• Check lead qualification process'}`,
    data: {
      conversion_rate: conversionRate,
      total_visitors: totalVisitors,
      total_leads: totalLeads
    },
    chart: 'line'
  };
}

async function getDuplicateLeadsAnalysis() {
  const duplicates = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count
    FROM "Lead"
    WHERE email IS NOT NULL
    AND "createdAt" >= NOW() - INTERVAL '7 days'
    GROUP BY email
    HAVING COUNT(*) > 1
  ` as Array<{ email: string; count: bigint }>;

  const duplicateCount = duplicates.length;
  const totalDuplicateLeads = duplicates.reduce((sum, dup) => sum + Number(dup.count), 0);

  return {
    content: `🔍 **Duplicate Leads Analysis (Last 7 Days)**\n\n• Duplicate Email Addresses: **${duplicateCount}**\n• Total Duplicate Entries: **${totalDuplicateLeads}**\n• Data Quality Impact: ${duplicateCount > 0 ? 'Needs attention' : 'Good'}\n\n⚡ **Actions Available:**\n${duplicateCount > 0 ? `• Review ${duplicateCount} duplicate entries\n• Implement email validation\n• Set up automatic deduplication` : '• No duplicates found this week\n• Data quality is maintained\n• Continue monitoring'}\n\n💡 **Recommendation**: ${duplicateCount > 5 ? 'Priority cleanup needed for data accuracy' : 'Current duplicate levels are manageable'}`,
    data: {
      duplicate_emails: duplicateCount,
      total_duplicates: totalDuplicateLeads
    },
    chart: duplicateCount > 0 ? 'pie' : undefined
  };
}

async function getROIAnalysis() {
  const leads = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      source: true,
      estimatedValue: true,
      status: true
    }
  });

  const sourceROI = leads.reduce((acc, lead) => {
    const source = lead.source || 'Direct';
    if (!acc[source]) {
      acc[source] = { leads: 0, value: 0 };
    }
    acc[source].leads++;
    acc[source].value += lead.estimatedValue || 0;
    return acc;
  }, {} as Record<string, { leads: number; value: number }>);

  const topSources = Object.entries(sourceROI)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 4);

  const totalValue = Object.values(sourceROI).reduce((sum, s) => sum + s.value, 0);

  return {
    content: `💰 **ROI Analysis by Traffic Source (Last 30 Days)**\n\n🥇 **Top Performing Sources:**\n${topSources.map((source, index) => 
      `${index + 1}. **${source[0]}**: €${source[1].value.toLocaleString()} (${source[1].leads} leads)`
    ).join('\n')}\n\n📊 **Total Pipeline Value**: €${totalValue.toLocaleString()}\n\n💡 **Insights:**\n${topSources.length > 0 ? `• ${topSources[0][0]} is your highest value source\n• Focus budget on top performing channels\n• Monitor conversion quality vs quantity` : '• Limited data available for ROI analysis\n• Ensure proper source tracking is enabled\n• Review attribution settings'}`,
    data: Object.fromEntries(topSources),
    chart: 'pie'
  };
}

async function getLocationAnalysis() {
  const leads = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      city: true,
      county: true
    }
  });

  const locationStats = leads.reduce((acc, lead) => {
    const location = lead.city || lead.county || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalLeads = leads.length;

  return {
    content: `🗺️ **Leads by Geographic Location (Last 30 Days)**\n\n🏙️ **Top Locations:**\n${topLocations.map((location, index) => 
      `${index + 1}. **${location[0]}**: ${location[1]} leads (${((location[1] / totalLeads) * 100).toFixed(1)}%)`
    ).join('\n')}\n\n📈 **Total Leads**: ${totalLeads}\n\n💡 **Geographic Insights:**\n${topLocations.length > 0 ? `• ${topLocations[0][0]} is your strongest market\n• Consider targeted campaigns in top locations\n• Expand coverage in underperforming areas` : '• Location data needs improvement\n• Enable geolocation tracking\n• Request location information in forms'}`,
    data: Object.fromEntries(topLocations),
    chart: 'bar'
  };
}

async function getGeneralAnalysis() {
  const [totalLeads, totalVisitors, recentLeads] = await Promise.all([
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.visitor.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const conversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;

  return {
    content: `📊 **General Analytics Summary (Last 30 Days)**\n\n• Total Leads: **${totalLeads.toLocaleString()}**\n• Total Visitors: **${totalVisitors.toLocaleString()}**\n• Conversion Rate: **${conversionRate.toFixed(2)}%**\n• Recent Leads (7 days): **${recentLeads}**\n\n💡 **Try asking more specific questions like:**\n• "Show me conversion rates by landing page"\n• "What's our best performing campaign?"\n• "How many leads came from Dublin this month?"\n• "Analyze our Facebook ad performance"\n\n🔍 **Available Analysis:**\n• Lead source performance\n• Geographic distribution\n• Conversion optimization\n• ROI by channel`,
    data: {
      total_leads: totalLeads,
      total_visitors: totalVisitors,
      conversion_rate: conversionRate,
      recent_leads: recentLeads
    },
    chart: 'bar'
  };
}