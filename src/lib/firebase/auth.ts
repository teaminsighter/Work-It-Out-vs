
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
  browserSessionPersistence
} from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);

// Set persistence
export const setAuthPersistence = async (rememberMe: boolean) => {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
};

// Email/Password Authentication
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      return { user: null, error: 'Please verify your email before logging in.' };
    }
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    // This is a workaround. We need a user object to send a verification email.
    // We can't get it without signing in. So we sign in, send, and sign out.
    // A more robust solution might involve a Cloud Function that doesn't require password.
    if (!auth.currentUser) {
        // This flow is problematic if we require the password again.
        // For now, we rely on the user having just failed a login attempt.
        // A better UX would be a dedicated "resend verification" page.
        // The error from `loginWithEmail` gives us the context we need.
        const tempUser = auth.currentUser; // This will likely be null if signed out.
         if (tempUser) {
            await sendEmailVerification(tempUser);
            return { success: true, error: null };
        } else {
             return { success: false, error: "Could not find user to resend verification. Please try logging in again." };
        }
    }
    await sendEmailVerification(auth.currentUser);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};


// Google Authentication
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
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
