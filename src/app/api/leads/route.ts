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

    // Get leads from database with form step data
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        formSteps: true,
        abTest: true,
        abTestAssignment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform leads to match the interface expected by the component
    const transformedLeads = leads.map(lead => ({
      // Basic Lead Info
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email || '',
      phone: lead.phone || '',
      contactPreference: lead.contactPreference,
      bestTimeToCall: lead.bestTimeToCall,
      status: lead.status,
      source: lead.source,
      score: lead.score,
      tags: lead.tags,
      notes: lead.notes,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),

      // Enhanced Tracking Fields
      dateCreated: lead.dateCreated?.toISOString(),
      dateModified: lead.dateModified?.toISOString(),

      // UTM Parameters
      utmCampaign: lead.utmCampaign,
      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmContent: lead.utmContent,
      utmKeyword: lead.utmKeyword,
      utmPlacement: lead.utmPlacement,

      // URL Tracking IDs
      gclid: lead.gclid,
      fbclid: lead.fbclid,

      // User/Device Information
      visitorUserId: lead.visitorUserId,
      ipAddress: lead.ipAddress,
      device: lead.device,
      displayAspectRatio: lead.displayAspectRatio,
      defaultLocation: lead.defaultLocation,

      // Form Tracking
      formId: lead.formId,
      formClass: lead.formClass,
      formName: lead.formName,
      formType: lead.formType,

      // Insurance Form Data
      insuranceTypes: lead.insuranceTypes ? JSON.parse(lead.insuranceTypes) : null,
      existingPolicy: lead.existingPolicy,
      whoToCover: lead.whoToCover,
      smokingStatus: lead.smokingStatus,
      gender: lead.gender,
      age: lead.age,
      medicalConditions: lead.medicalConditions ? JSON.parse(lead.medicalConditions) : null,
      healthChanges: lead.healthChanges ? JSON.parse(lead.healthChanges) : null,
      householdIncome: lead.householdIncome,
      coverageAmount: lead.coverageAmount,
      coveragePercentage: lead.coveragePercentage,
      occupation: lead.occupation,
      propertyType: lead.propertyType,
      vehicleType: lead.vehicleType,
      vehicleAge: lead.vehicleAge,
      businessType: lead.businessType,
      location: lead.location,

      // SMS Verification
      phoneVerified: lead.phoneVerified,

      // Form Completion
      stepsCompleted: lead.stepsCompleted,
      totalSteps: lead.totalSteps,
      completionRate: lead.completionRate,
      timeToComplete: lead.timeToComplete,
      formStartedAt: lead.formStartedAt?.toISOString(),
      formCompletedAt: lead.formCompletedAt?.toISOString(),

      // A/B Test Tracking
      abTestId: lead.abTestId,
      abVariant: lead.abVariant,
      abTest: lead.abTest,
      abTestAssignment: lead.abTestAssignment,

      // Visit Tracking
      firstVisitUrl: lead.firstVisitUrl,
      lastVisitUrl: lead.lastVisitUrl,

      // Form Steps Data
      formSteps: lead.formSteps
    }));

    return NextResponse.json(transformedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      contactPreference = 'EMAIL',
      formType, // health, life, income, trauma, mortgage
      formData, // All form responses
      formSteps, // Individual step data
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmKeyword,
      gclid,
      fbclid,
      visitorUserId,
      ipAddress,
      device,
      firstVisitUrl,
      lastVisitUrl,
      abTestId,
      abVariant,
      timeToComplete
    } = body;

    // Prepare insurance form data from formData
    const insuranceData = formData ? {
      formType,
      insuranceTypes: formData.insuranceTypes ? JSON.stringify(formData.insuranceTypes) : null,
      existingPolicy: formData.existingPolicy,
      whoToCover: formData.whoToCover,
      smokingStatus: formData.smokingStatus,
      gender: formData.gender,
      age: formData.age ? parseInt(formData.age) : null,
      medicalConditions: formData.medicalConditions ? JSON.stringify(formData.medicalConditions) : null,
      healthChanges: formData.healthChanges ? JSON.stringify(formData.healthChanges) : null,
      householdIncome: formData.householdIncome,
      coverageAmount: formData.coverageAmount,
      coveragePercentage: formData.coveragePercentage,
      occupation: formData.occupation,
      propertyType: formData.propertyType,
      vehicleType: formData.vehicleType,
      vehicleAge: formData.vehicleAge,
      businessType: formData.businessType,
      location: formData.location,
      phoneVerified: formData.phoneVerified || false,
      stepsCompleted: formSteps ? formSteps.length : 0,
      totalSteps: formData.totalSteps,
      timeToComplete,
      formStartedAt: formData.formStartedAt ? new Date(formData.formStartedAt) : new Date(),
      formCompletedAt: new Date()
    } : {};

    // Create lead in database with all tracking data
    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        contactPreference,
        status: 'NEW',
        source: utmSource || 'website',
        score: 50, // Default lead score
        
        // UTM Parameters
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmKeyword,
        
        // Tracking IDs
        gclid,
        fbclid,
        
        // Device & Visit Data
        visitorUserId,
        ipAddress,
        device,
        firstVisitUrl,
        lastVisitUrl,
        
        // A/B Testing
        abTestId,
        abVariant,
        
        // Insurance Form Data
        ...insuranceData
      }
    });

    // Save individual form step data for detailed analytics
    if (formSteps && formSteps.length > 0) {
      const stepDataPromises = formSteps.map((step: any, index: number) => 
        prisma.formStepData.create({
          data: {
            leadId: lead.id,
            stepId: step.stepId,
            stepNumber: index + 1,
            questionText: step.questionText,
            answerValue: step.answerValue,
            answerText: step.answerText,
            timeOnStep: step.timeOnStep,
            attemptCount: step.attemptCount || 1
          }
        })
      );
      
      await Promise.all(stepDataPromises);
    }

    // Track form completion event
    if (visitorUserId) {
      await prisma.userInteraction.create({
        data: {
          userId: visitorUserId,
          sessionId: `session_${Date.now()}`,
          eventType: 'form_complete',
          eventData: formData || {},
          page: `/${formType || 'main'}`,
          elementId: 'quote-form',
          elementText: 'Lead Submission'
        }
      });
    }

    // Track in form analytics
    if (formType) {
      await prisma.formAnalytics.create({
        data: {
          userId: visitorUserId || `guest_${Date.now()}`,
          sessionId: `session_${Date.now()}`,
          formType,
          stepNumber: formSteps ? formSteps.length : 1,
          stepName: 'form_complete',
          questionId: 'completion',
          questionText: 'Form Completed',
          isCompleted: true,
          timeOnStep: timeToComplete
        }
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Lead created successfully'
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create lead' 
    }, { status: 500 });
  }
}