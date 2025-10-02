import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('range') || '7d';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    // Build filters
    const where: any = {
      createdAt: {
        gte: startDate
      }
    };

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = {
        contains: source,
        mode: 'insensitive'
      };
    }

    // Get total count for pagination
    const totalLeads = await prisma.lead.count({ where });

    // Get leads with pagination
    const leads = await prisma.lead.findMany({
      where,
      include: {
        systemDetails: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get lead statistics
    const statusStats = await prisma.lead.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true
    });

    const sourceStats = await prisma.lead.groupBy({
      by: ['source'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true,
      orderBy: {
        _count: {
          source: 'desc'
        }
      },
      take: 10
    });

    // Calculate conversion funnel
    const funnelData = statusStats.map(stat => ({
      status: stat.status,
      count: stat._count,
      percentage: (stat._count / totalLeads) * 100
    }));

    // Get daily lead trends
    const dailyLeads = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayLeadsCount = await prisma.lead.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDay
          }
        }
      });

      const dayLeadsConverted = await prisma.lead.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDay
          },
          status: {
            in: ['QUALIFIED', 'CONVERTED']
          }
        }
      });
      
      dailyLeads.push({
        date: date.toISOString().split('T')[0],
        total: dayLeadsCount,
        converted: dayLeadsConverted,
        conversionRate: dayLeadsCount > 0 ? (dayLeadsConverted / dayLeadsCount) * 100 : 0
      });
    }

    // Calculate lead quality scores
    const averageScore = await prisma.lead.aggregate({
      where,
      _avg: {
        score: true
      }
    });

    // Get recent high-value leads (score > 80)
    const highValueLeads = await prisma.lead.findMany({
      where: {
        ...where,
        score: {
          gte: 80
        }
      },
      orderBy: {
        score: 'desc'
      },
      take: 5,
      include: {
        systemDetails: true
      }
    });

    // Calculate revenue potential
    const revenueData = await prisma.systemDetails.aggregate({
      where: {
        lead: {
          createdAt: {
            gte: startDate
          }
        }
      },
      _sum: {
        estimatedCost: true,
        annualSavings: true
      },
      _avg: {
        estimatedCost: true
      }
    });

    const response = {
      success: true,
      data: {
        leads: leads.map(lead => ({
          id: lead.id,
          name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          score: lead.score,
          tags: lead.tags,
          createdAt: lead.createdAt,
          systemDetails: lead.systemDetails ? {
            estimatedCost: lead.systemDetails.estimatedCost,
            annualSavings: lead.systemDetails.annualSavings,
            address: lead.systemDetails.address,
            propertyType: lead.systemDetails.propertyType
          } : null
        })),
        pagination: {
          page,
          limit,
          total: totalLeads,
          totalPages: Math.ceil(totalLeads / limit)
        },
        statistics: {
          total: totalLeads,
          averageScore: Number(averageScore._avg.score?.toFixed(1)) || 0,
          statusBreakdown: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count,
            percentage: Number(((stat._count / totalLeads) * 100).toFixed(1))
          })),
          sourceBreakdown: sourceStats.map(stat => ({
            source: stat.source,
            count: stat._count,
            percentage: Number(((stat._count / totalLeads) * 100).toFixed(1))
          })),
          revenueProjection: {
            totalEstimatedValue: revenueData._sum.estimatedCost || 0,
            totalAnnualSavings: revenueData._sum.annualSavings || 0,
            averageLeadValue: revenueData._avg.estimatedCost || 0
          }
        },
        trends: {
          daily: dailyLeads,
          funnel: funnelData
        },
        highValueLeads: highValueLeads.map(lead => ({
          id: lead.id,
          name: `${lead.firstName} ${lead.lastName}`,
          score: lead.score,
          source: lead.source,
          status: lead.status,
          potentialValue: lead.systemDetails?.estimatedCost || 0,
          createdAt: lead.createdAt
        })),
        filters: {
          availableStatuses: statusStats.map(s => s.status),
          availableSources: sourceStats.map(s => s.source)
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Lead analytics API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch lead analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}