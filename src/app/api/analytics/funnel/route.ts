import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all visitor sessions and their progression through the form
    const visitors = await prisma.visitorTracking.findMany({
      orderBy: { timestamp: 'desc' },
      take: 1000 // Limit to recent 1000 visitors for performance
    });

    // Mock funnel data based on typical user flow
    // In a real implementation, you'd track actual step completions
    const totalEntries = visitors.length;
    
    if (totalEntries === 0) {
      return NextResponse.json([]);
    }

    // Simulate realistic conversion rates for insurance form steps
    const funnelSteps = [
      {
        stepNumber: 1,
        stepName: 'Landing Page Visit',
        totalEntries: totalEntries,
        completions: Math.floor(totalEntries * 0.82), // 82% continue past landing
        dropOffs: Math.floor(totalEntries * 0.18),
        conversionRate: 82.0,
        averageDuration: 15.4,
        popularChoices: {
          'Started Quote Process': Math.floor(totalEntries * 0.70),
          'Browsed Information': Math.floor(totalEntries * 0.12)
        }
      },
      {
        stepNumber: 2,
        stepName: 'Insurance Type Selection',
        totalEntries: Math.floor(totalEntries * 0.82),
        completions: Math.floor(totalEntries * 0.68), // 83% select insurance type
        dropOffs: Math.floor(totalEntries * 0.14),
        conversionRate: 83.0,
        averageDuration: 28.7,
        popularChoices: {
          'Life Insurance': Math.floor(totalEntries * 0.25),
          'Health Insurance': Math.floor(totalEntries * 0.20),
          'Income Protection': Math.floor(totalEntries * 0.15),
          'Mortgage Protection': Math.floor(totalEntries * 0.08)
        }
      },
      {
        stepNumber: 3,
        stepName: 'Coverage Requirements',
        totalEntries: Math.floor(totalEntries * 0.68),
        completions: Math.floor(totalEntries * 0.55), // 81% complete coverage details
        dropOffs: Math.floor(totalEntries * 0.13),
        conversionRate: 80.9,
        averageDuration: 42.3,
        popularChoices: {
          'Standard Coverage': Math.floor(totalEntries * 0.30),
          'Comprehensive Coverage': Math.floor(totalEntries * 0.20),
          'Basic Coverage': Math.floor(totalEntries * 0.05)
        }
      },
      {
        stepNumber: 4,
        stepName: 'Personal Details',
        totalEntries: Math.floor(totalEntries * 0.55),
        completions: Math.floor(totalEntries * 0.44), // 80% complete personal info
        dropOffs: Math.floor(totalEntries * 0.11),
        conversionRate: 80.0,
        averageDuration: 51.2,
        popularChoices: {
          'Age 25-35': Math.floor(totalEntries * 0.18),
          'Age 36-45': Math.floor(totalEntries * 0.15),
          'Age 46-55': Math.floor(totalEntries * 0.11)
        }
      },
      {
        stepNumber: 5,
        stepName: 'Contact Information',
        totalEntries: Math.floor(totalEntries * 0.44),
        completions: Math.floor(totalEntries * 0.37), // 84% provide contact details
        dropOffs: Math.floor(totalEntries * 0.07),
        conversionRate: 84.1,
        averageDuration: 35.8,
        popularChoices: {
          'Email + Phone': Math.floor(totalEntries * 0.22),
          'Email Only': Math.floor(totalEntries * 0.10),
          'Phone Only': Math.floor(totalEntries * 0.05)
        }
      },
      {
        stepNumber: 6,
        stepName: 'Quote Generation',
        totalEntries: Math.floor(totalEntries * 0.37),
        completions: Math.floor(totalEntries * 0.33), // 89% receive quotes
        dropOffs: Math.floor(totalEntries * 0.04),
        conversionRate: 89.2,
        averageDuration: 18.5,
        popularChoices: {
          'Multiple Quotes Compared': Math.floor(totalEntries * 0.20),
          'Single Quote Viewed': Math.floor(totalEntries * 0.10),
          'Quote Downloaded': Math.floor(totalEntries * 0.03)
        }
      }
    ];

    return NextResponse.json(funnelSteps);
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
  }
}