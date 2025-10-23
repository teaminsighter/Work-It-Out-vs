const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seeding...');

  try {
    // Check if users already exist to avoid duplicates
    const existingUsers = await prisma.user.count();
    
    if (existingUsers === 0) {
      console.log('📝 Creating initial admin users...');
      
      // Create admin users
      await prisma.user.create({
        data: {
          email: 'admin@workitout.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'SUPER_ADMIN',
          isActive: true,
          emailVerified: true
        }
      });

      await prisma.user.create({
        data: {
          email: 'manager@workitout.com',
          firstName: 'Manager',
          lastName: 'User', 
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });

      console.log('✅ Admin users created successfully');
    } else {
      console.log('ℹ️  Admin users already exist, skipping...');
    }

    // Check if landing pages exist
    const existingPages = await prisma.landingPage.count();
    
    if (existingPages === 0) {
      console.log('📄 Creating landing pages...');
      
      // Create essential landing pages
      const landingPages = [
        {
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
            sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA']
          },
          seoTitle: 'Get Your Insurance Quote - Work It Out',
          seoDescription: 'Get your insurance quote in minutes.'
        },
        {
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
            sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA']
          },
          seoTitle: 'Health Insurance Quotes - Work It Out',
          seoDescription: 'Compare health insurance plans and get the best coverage for your family.'
        },
        {
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
            sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA']
          },
          seoTitle: 'Life Insurance Quotes - Work It Out',
          seoDescription: 'Compare life insurance plans and secure your family\'s financial future.'
        },
        {
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
            sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA']
          },
          seoTitle: 'Income Protection Insurance - Work It Out',
          seoDescription: 'Protect your income with comprehensive income protection insurance plans.'
        }
      ];

      for (const page of landingPages) {
        await prisma.landingPage.create({ data: page });
      }

      console.log('✅ Landing pages created successfully');
    } else {
      console.log('ℹ️  Landing pages already exist, skipping...');
    }

    // Check if pricing tiers exist
    const existingPricing = await prisma.pricingTier.count();
    
    if (existingPricing === 0) {
      console.log('💰 Creating pricing tiers...');
      
      await prisma.pricingTier.create({
        data: {
          name: 'Standard Plan',
          pricePerWatt: 100,
          minSystemSize: 1,
          maxSystemSize: 10,
          isActive: true
        }
      });

      console.log('✅ Pricing tiers created successfully');
    } else {
      console.log('ℹ️  Pricing tiers already exist, skipping...');
    }

    // Create system settings if they don't exist
    const existingSettings = await prisma.systemSettings.count();
    
    if (existingSettings === 0) {
      console.log('⚙️  Creating system settings...');
      
      await prisma.systemSettings.create({
        data: {
          companyName: process.env.COMPANY_NAME || 'Work It Out',
          companyEmail: process.env.COMPANY_EMAIL || 'info@workitout.com',
          companyPhone: process.env.COMPANY_PHONE || '+64 9 XXX XXXX',
          companyAddress: process.env.COMPANY_ADDRESS || 'New Zealand',
          companyWebsite: process.env.NEXTAUTH_URL || 'https://workitout.com',
          companyLogo: '/logo.png',
          adminPanelName: 'Work It Out Admin',
          primaryColor: '#8B5CF6',
          secondaryColor: '#EC4899',
          navbarColor: '#1F2937',
          buttonColor: '#8B5CF6',
          language: 'en',
          timezone: 'Pacific/Auckland',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24',
          currency: 'NZD',
          numberFormat: '1,234.56',
          theme: 'light',
          logoPosition: 'left',
          sidebarCollapsed: false,
          compactMode: false,
          autoSave: true,
          autoBackup: true,
          sessionTimeout: 3600000,
          maxLoginAttempts: 5,
          passwordExpiry: 90,
          emailNotifications: true,
          pushNotifications: false,
          smsNotifications: false,
          notificationSound: true,
          twoFactorRequired: false,
          passwordComplexity: 'medium',
          dataRetention: 365,
          activityLogging: true,
          ipWhitelist: '[]',
          cacheEnabled: true,
          compressionEnabled: true,
          cdnEnabled: false,
          maxFileSize: 10485760,
          country: 'New Zealand',
          region: 'Auckland',
          city: 'Auckland',
          postalCode: '1010'
        }
      });

      console.log('✅ System settings created successfully');
    } else {
      console.log('ℹ️  System settings already exist, skipping...');
    }

    console.log('🎉 Production database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();