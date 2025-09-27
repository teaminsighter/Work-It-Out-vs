
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * A Firebase Function that triggers when a new user is created in Firebase Authentication.
 * It creates a corresponding user document in the 'users' collection in Firestore.
 */
export const createUserDocument = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  const newUserRef = db.collection('users').doc(uid);

  try {
    await newUserRef.set({
      user_id: uid,
      email: email,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login: null,
      role: 'viewer', // Default role for new users
      permissions: [], // Default empty permissions
      account_status: 'active',
      profile: {
        name: displayName || '',
        company: '',
        phone: '',
        avatar_url: photoURL || '',
      },
    });
    console.log(`Successfully created user document for UID: ${uid}`);
  } catch (error) {
    console.error(`Error creating user document for UID: ${uid}`, error);
  }
});
