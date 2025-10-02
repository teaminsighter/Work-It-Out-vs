import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Clear existing visitor tracking data
    await prisma.visitorTracking.deleteMany({});

    const pages = ['/', '/health', '/income', '/life', '/new'];
    const countries = ['New Zealand', 'Australia', 'United States', 'United Kingdom', 'Canada'];
    const cities = ['Auckland', 'Wellington', 'Christchurch', 'Sydney', 'Melbourne', 'New York', 'London', 'Toronto'];
    const devices = ['desktop', 'mobile', 'tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
    const referrers = [
      'https://google.com',
      'https://facebook.com',
      'https://twitter.com',
      'https://linkedin.com',
      null // Direct traffic
    ];

    const visitorData = [];
    
    // Generate visitor data for the last 30 days
    for (let day = 0; day < 30; day++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - day);
      
      // Generate 10-50 visitors per day
      const visitorsPerDay = Math.floor(Math.random() * 40) + 10;
      
      for (let visitor = 0; visitor < visitorsPerDay; visitor++) {
        const timestamp = new Date(baseDate);
        // Random hour between 8 AM and 11 PM
        timestamp.setHours(Math.floor(Math.random() * 15) + 8);
        timestamp.setMinutes(Math.floor(Math.random() * 60));
        timestamp.setSeconds(Math.floor(Math.random() * 60));
        
        const sessionId = `session_${Date.now()}_${visitor}_${day}`;
        const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const country = countries[Math.floor(Math.random() * countries.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const deviceType = devices[Math.floor(Math.random() * devices.length)];
        const browser = browsers[Math.floor(Math.random() * browsers.length)];
        const userAgent = `Mozilla/5.0 (${deviceType === 'mobile' ? 'Mobile' : 'Windows NT 10.0'}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/120.0.0.0`;
        const referrer = referrers[Math.floor(Math.random() * referrers.length)];
        
        // Generate 1-5 page views per visitor session
        const pageViewsPerSession = Math.floor(Math.random() * 4) + 1;
        
        for (let pageView = 0; pageView < pageViewsPerSession; pageView++) {
          const pageTimestamp = new Date(timestamp);
          pageTimestamp.setMinutes(timestamp.getMinutes() + pageView * 2); // 2 minutes apart
          
          const page = pages[Math.floor(Math.random() * pages.length)];
          
          visitorData.push({
            ipAddress,
            country,
            city,
            region: country === 'New Zealand' ? (city === 'Auckland' ? 'Auckland' : 'Other') : 'International',
            userAgent,
            page,
            referrer: pageView === 0 ? referrer : null, // Only first page has referrer
            sessionId: `${sessionId}_${pageView}`,
            deviceType,
            browser,
            os: deviceType === 'mobile' ? 'iOS' : 'Windows',
            isBot: Math.random() < 0.05, // 5% chance of being a bot
            timestamp: pageTimestamp
          });
        }
      }
    }

    // Batch insert visitor data
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < visitorData.length; i += batchSize) {
      const batch = visitorData.slice(i, i + batchSize);
      await prisma.visitorTracking.createMany({
        data: batch
      });
      insertedCount += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: 'Visitor tracking data seeded successfully',
      data: {
        visitorsCreated: insertedCount,
        daysGenerated: 30,
        pagesTracked: pages.length
      }
    });
  } catch (error) {
    console.error('Seed visitors error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed visitor data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}