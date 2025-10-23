import { NextRequest, NextResponse } from 'next/server';

// In production, you should store verification codes in Redis or database
// For now, we'll use a simple in-memory store (not suitable for production)
const verificationStore = new Map<string, { code: string; timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, sentCode } = await request.json();
    
    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' }, 
        { status: 400 }
      );
    }

    // For demo purposes, we're accepting the sentCode parameter
    // In production, retrieve the stored code for this phone number
    const storedData = verificationStore.get(phoneNumber) || { code: sentCode, timestamp: Date.now() };
    
    // Check if code exists and is not expired (10 minutes)
    const isExpired = Date.now() - storedData.timestamp > 10 * 60 * 1000;
    
    if (isExpired) {
      verificationStore.delete(phoneNumber);
      return NextResponse.json(
        { error: 'Verification code has expired' }, 
        { status: 400 }
      );
    }

    // Verify the code
    if (storedData.code === code) {
      // Remove the code after successful verification
      verificationStore.delete(phoneNumber);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Phone number verified successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification code' }, 
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('SMS verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to store verification code (for production use)
export function storeVerificationCode(phoneNumber: string, code: string) {
  verificationStore.set(phoneNumber, {
    code,
    timestamp: Date.now()
  });
}