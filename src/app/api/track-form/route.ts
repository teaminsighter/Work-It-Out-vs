import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionId,
      formType,
      stepNumber,
      stepName,
      questionId,
      questionText,
      answerValue = null,
      answerText = null,
      timeOnStep = null,
      isCompleted = false,
      isDropOff = false,
      timestamp
    } = body;

    // Create form analytics record
    await prisma.formAnalytics.create({
      data: {
        userId,
        sessionId,
        formType,
        stepNumber,
        stepName,
        questionId,
        questionText,
        answerValue,
        answerText,
        timeOnStep,
        isCompleted,
        isDropOff,
        timestamp: new Date(timestamp || Date.now())
      }
    });

    // Track form interaction
    await prisma.userInteraction.create({
      data: {
        userId,
        sessionId,
        eventType: isCompleted ? 'form_complete' : isDropOff ? 'form_drop_off' : 'form_step',
        eventData: {
          formType,
          stepNumber,
          stepName,
          questionId,
          answerValue,
          timeOnStep
        },
        page: `/form/${formType}`,
        elementId: questionId,
        timestamp: new Date(timestamp || Date.now())
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Form analytics tracked successfully'
    });
  } catch (error) {
    console.error('Form analytics tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track form analytics'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}