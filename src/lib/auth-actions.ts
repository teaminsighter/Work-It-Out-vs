
'use server';

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string;
  if (serviceAccountString) {
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        // The private_key needs to have its newlines correctly formatted.
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
    } catch (e: any) {
        console.error('Failed to parse or initialize Firebase Admin SDK:', e.message);
    }
  } else {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
  }
}


export const resendVerificationEmailAction = async (email: string) => {
  if (!email) {
    return { success: false, error: 'Email is required.' };
  }
  
  if (!admin.apps.length || !admin.app()) {
    console.error('Firebase Admin SDK not initialized.');
    return {
      success: false,
      error: 'Server configuration error. Please try again later.',
    };
  }


  try {
    const user = await admin.auth().getUserByEmail(email);

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified.' };
    }

    const link = await admin.auth().generateEmailVerificationLink(email);

    // In a real app, you would send this link via a transactional email service.
    // For this example, we log it to the server console to confirm it works.
    console.log('Generated verification link:', link);

    return { success: true, error: null };
    
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    if (error.code === 'auth/user-not-found') {
      return {
        success: false,
        error: 'Could not find an account with that email address.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};
