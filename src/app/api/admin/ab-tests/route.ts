import { NextResponse } from 'next/server';
import ABTestingService from '@/lib/services/abTestingService';

export async function GET() {
  try {
    const tests = await ABTestingService.getAllTests();
    return NextResponse.json({
      success: true,
      data: tests
    });
  } catch (error) {
    console.error('Get A/B tests error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch A/B tests'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const testId = await ABTestingService.createTest({
      ...body,
      createdBy: 'admin-user' // Replace with actual user ID from session
    });
    
    return NextResponse.json({
      success: true,
      data: { testId }
    });
  } catch (error) {
    console.error('Create A/B test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create A/B test'
    }, { status: 500 });
  }
}