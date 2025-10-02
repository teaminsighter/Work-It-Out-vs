import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionId,
      page,
      timeOnPage,
      scrollDepth,
      interactionCount,
      exitPage = true
    } = body;

    // Update visitor tracking with exit data
    await prisma.visitorTracking.updateMany({
      where: {
        userId,
        sessionId,
        page,
        exitPage: false
      },
      data: {
        timeOnPage,
        scrollDepth,
        exitPage
      }
    });

    // Update session with end time and duration
    const session = await prisma.userSession.findUnique({
      where: { sessionId }
    });

    if (session) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
      
      await prisma.userSession.update({
        where: { sessionId },
        data: {
          endTime,
          duration
        }
      });
    }

    // Track exit interaction
    await prisma.userInteraction.create({
      data: {
        userId,
        sessionId,
        eventType: 'page_exit',
        eventData: {
          timeOnPage,
          scrollDepth,
          interactionCount,
          page
        },
        page,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Exit tracked successfully'
    });
  } catch (error) {
    console.error('Exit tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track exit'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}