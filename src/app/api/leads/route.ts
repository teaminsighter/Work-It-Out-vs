import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get leads from database
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform leads to match the interface expected by the component
    const transformedLeads = leads.map(lead => ({
      id: lead.id.toString(),
      user_id: `usr_${lead.id}`,
      name: lead.fullName || 'Unknown',
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      created_at: lead.createdAt.toISOString(),
      last_visit: lead.createdAt.toISOString(), // Use created date as last visit for now
      total_visits: 1, // Default to 1 visit
      utm_source: 'direct', // Default source
      utm_campaign: '',
      conversion_status: 'lead' as const,
      quote_value: 0, // Default quote value
      new_submission: false,
      form_steps_completed: 6, // Assume completed forms have all steps
      total_form_steps: 6,
      systemDetails: lead.monthlyBill ? {
        systemSize: 0,
        estimatedCost: 0,
        annualSavings: 0,
        paybackPeriod: 0,
        panelCount: 0,
        roofArea: 0,
        monthlyBill: lead.monthlyBill,
        usageKwh: 0,
        propertyType: 'residential',
        roofType: 'pitched'
      } : undefined
    }));

    return NextResponse.json(transformedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}