
'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { app } from './config';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const auth = getAuth(app);
const functions = getFunctions(app);

// Set persistence
export const setAuthPersistence = async (rememberMe: boolean) => {
  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence;
  await setPersistence(auth, persistence);
};

// Email/Password Authentication
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    // Send verification email
    await sendEmailVerification(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const loginWithEmail = async (
  email: string,
  password: string,
  rememberMe: boolean = false
) => {
  try {
    await setAuthPersistence(rememberMe);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      return {
        user: null,
        error: 'Please verify your email before logging in.',
      };
    }
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const sendVerificationEmail = httpsCallable(
      functions,
      'sendVerificationEmail'
    );
    await sendVerificationEmail({ email });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    if (error.message.includes('user-not-found')) {
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

// Google Authentication
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
