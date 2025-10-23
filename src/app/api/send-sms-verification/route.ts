import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' }, 
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if this is a test/demo number (non-NZ numbers or specific test numbers)
    const isTestMode = !phoneNumber.startsWith('+64') || phoneNumber.includes('12345') || process.env.NODE_ENV === 'development';
    
    if (isTestMode) {
      // Demo mode - don't actually send SMS, just return success
      console.log(`Demo mode: Would send SMS to ${phoneNumber} with code: ${verificationCode}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'SMS sent successfully (Demo Mode)',
        verificationCode: verificationCode,
        demoMode: true
      });
    }
    
    // Prepare SMS message for real SMS
    const message = `Your Work It Out verification code is: ${verificationCode}. Valid for 10 minutes.`;
    
    try {
      // TransmitSMS API call
      const response = await fetch(process.env.SMS_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: process.env.SMS_API_USERNAME,
          password: process.env.SMS_API_PASSWORD,
          to: phoneNumber,
          message: message,
          from: 'WorkItOut'
        })
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If response is not JSON, get text
        const responseText = await response.clone().text();
        console.error('Non-JSON response from TransmitSMS:', responseText);
        
        // For testing, still return success but note the issue
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({ 
            success: true, 
            message: 'SMS API issue - using demo mode',
            verificationCode: verificationCode,
            demoMode: true,
            apiError: responseText
          });
        }
        
        result = { error: 'Invalid API response', details: responseText };
      }
      
      if (response.ok && (result.success || !result.error)) {
        return NextResponse.json({ 
          success: true, 
          message: 'SMS sent successfully',
          // Remove this in production - only for testing
          verificationCode: verificationCode 
        });
      } else {
        console.error('TransmitSMS API error:', result);
        
        // Fallback to demo mode if API fails
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({ 
            success: true, 
            message: 'SMS API failed - using demo mode',
            verificationCode: verificationCode,
            demoMode: true,
            apiError: result
          });
        }
        
        return NextResponse.json(
          { error: 'Failed to send SMS' }, 
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error('SMS API connection error:', apiError);
      
      // Fallback to demo mode if API is unreachable
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          message: 'SMS API unreachable - using demo mode',
          verificationCode: verificationCode,
          demoMode: true
        });
      }
      
      throw apiError;
    }

  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}