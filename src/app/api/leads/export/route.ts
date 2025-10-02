import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { format, dateRange, includeFields } = await request.json();
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
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

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'ID',
        'Name', 
        'Email',
        'Phone',
        'Address',
        'City',
        'Monthly Bill',
        'Created Date'
      ];
      
      const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
          lead.id,
          `"${lead.fullName || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.address || ''}"`,
          `"${lead.city || ''}"`,
          lead.monthlyBill || 0,
          lead.createdAt.toISOString()
        ].join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-export-${dateRange}.csv"`
        }
      });
    } 
    
    if (format === 'json') {
      // Generate JSON
      const jsonData = leads.map(lead => ({
        id: lead.id,
        name: lead.fullName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        address: lead.address || '',
        city: lead.city || '',
        monthlyBill: lead.monthlyBill || 0,
        createdAt: lead.createdAt.toISOString()
      }));

      return NextResponse.json(jsonData, {
        headers: {
          'Content-Disposition': `attachment; filename="leads-export-${dateRange}.json"`
        }
      });
    }
    
    return NextResponse.json({ 
      error: 'Unsupported format. Use csv or json.' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json({ 
      error: 'Failed to export leads' 
    }, { status: 500 });
  }
}