import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Clear existing data
    await prisma.aBTestVariant.deleteMany();
    await prisma.aBTest.deleteMany();
    await prisma.landingPage.deleteMany();
    await prisma.systemDetails.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.user.deleteMany();
    await prisma.pricingTier.deleteMany();
    await prisma.visitorTracking.deleteMany();

    // Create admin users
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@localpower.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@localpower.com',
        firstName: 'Manager',
        lastName: 'User', 
        role: 'ADMIN',
        isActive: true
      }
    });

    // Create landing pages
    const mainPage = await prisma.landingPage.create({
      data: {
        name: 'Main Landing Page',
        slug: '/',
        template: 'main',
        status: 'PUBLISHED',
        content: {
          hero: {
            type: 'Hero',
            title: 'Get Your Insurance Quote',
            subtitle: 'Compare plans and get the best deal in minutes',
            buttonText: 'Get Free Quote'
          },
          sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
          forms: {
            type: 'QuoteWizard',
            fields: ['name', 'email', 'phone']
          }
        },
        seoTitle: 'Get Your Insurance Quote - Work It Out',
        seoDescription: 'Get your insurance quote in minutes.'
      }
    });

    const healthPage = await prisma.landingPage.create({
      data: {
        name: 'Health Insurance Landing',
        slug: '/health',
        template: 'health',
        status: 'PUBLISHED',
        content: {
          hero: {
            type: 'HeroHealth',
            title: 'Health Insurance Made Simple',
            subtitle: 'Protect your family with comprehensive health coverage',
            buttonText: 'Get Health Quote'
          },
          sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
          forms: {
            type: 'QuoteWizardHealthNew',
            fields: ['name', 'email', 'phone', 'age', 'family_members']
          }
        },
        seoTitle: 'Health Insurance Quotes - Work It Out',
        seoDescription: 'Compare health insurance plans and get the best coverage for your family.'
      }
    });

    const incomePage = await prisma.landingPage.create({
      data: {
        name: 'Income Protection Landing',
        slug: '/income',
        template: 'income',
        status: 'PUBLISHED',
        content: {
          hero: {
            type: 'HeroIncome',
            title: 'Protect Your Income',
            subtitle: 'Secure your financial future with income protection insurance',
            buttonText: 'Get Income Quote'
          },
          sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
          forms: {
            type: 'QuoteWizardIncome',
            fields: ['name', 'email', 'phone', 'occupation', 'income']
          }
        },
        seoTitle: 'Income Protection Insurance - Work It Out',
        seoDescription: 'Protect your income with comprehensive income protection insurance plans.'
      }
    });

    const lifePage = await prisma.landingPage.create({
      data: {
        name: 'Life Insurance Landing',
        slug: '/life',
        template: 'life',
        status: 'PUBLISHED',
        content: {
          hero: {
            type: 'HeroLife',
            title: 'Life Insurance for Peace of Mind',
            subtitle: 'Protect your loved ones with comprehensive life insurance coverage',
            buttonText: 'Get Life Quote'
          },
          sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
          forms: {
            type: 'QuoteWizardLife',
            fields: ['name', 'email', 'phone', 'age', 'coverage_amount']
          }
        },
        seoTitle: 'Life Insurance Quotes - Work It Out',
        seoDescription: 'Compare life insurance plans and secure your family\'s financial future.'
      }
    });

    const newPage = await prisma.landingPage.create({
      data: {
        name: 'New Design Landing',
        slug: '/new',
        template: 'new',
        status: 'DRAFT',
        content: {
          hero: {
            type: 'HeroNew',
            title: 'Revolutionary Insurance Experience',
            subtitle: 'Experience the future of insurance with our new platform',
            buttonText: 'Try New Experience'
          },
          sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
          forms: {
            type: 'QuoteWizardNew',
            fields: ['name', 'email', 'phone']
          }
        },
        seoTitle: 'New Insurance Experience - Work It Out',
        seoDescription: 'Experience the future of insurance with our revolutionary new platform.'
      }
    });

    // No sample leads - real leads will be created from form submissions

    // Create pricing tiers
    await prisma.pricingTier.create({
      data: {
        name: 'Basic Health Plan',
        pricePerWatt: 120,
        minSystemSize: 1,
        maxSystemSize: 5,
        isActive: true
      }
    });

    // No sample visitor tracking - real tracking will be generated by VisitorTracking component

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      data: {
        users: 2,
        landingPages: 5,
        leads: 0,
        pricingTiers: 1,
        visitorTracking: 0
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}