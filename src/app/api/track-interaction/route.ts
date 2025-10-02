import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionId,
      eventType,
      eventData,
      page,
      elementId = null,
      elementText = null,
      timestamp
    } = body;

    // Create user interaction record
    await prisma.userInteraction.create({
      data: {
        userId,
        sessionId,
        eventType,
        eventData: eventData || {},
        page,
        elementId,
        elementText,
        timestamp: new Date(timestamp || Date.now())
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    console.error('Interaction tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track interaction'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}