
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * A Firebase Function that triggers when a new user is created in Firebase Authentication.
 * It creates a corresponding user document in the 'users' collection in Firestore.
 * The first user to be created is assigned the 'super_admin' role.
 */
export const createUserDocument = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  const usersCollectionRef = db.collection('users');
  const newUserRef = usersCollectionRef.doc(uid);

  try {
    const existingUsers = await usersCollectionRef.limit(1).get();
    let role = 'viewer'; // Default role
    if (existingUsers.empty) {
      role = 'super_admin';
    }

    await newUserRef.set({
      user_id: uid,
      email: email,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login: null,
      role: role,
      permissions: [], // Default empty permissions
      account_status: 'active',
      profile: {
        name: displayName || '',
        company: '',
        phone: '',
        avatar_url: photoURL || '',
      },
    });
    console.log(`Successfully created user document for UID: ${uid} with role: ${role}`);
  } catch (error) {
    console.error(`Error creating user document for UID: ${uid}`, error);
  }
});


/**
 * Process and aggregate dataLayer events as they are created in Firestore.
 */
exports.processDataLayerEvent = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    console.log('Processing event:', context.params.eventId, eventData);
    // TODO:
    // - Aggregate by variant
    // - Update real-time dashboards
    // - Calculate statistical significance
    // - Trigger webhooks
    // - Update user journey map
  });

/**
 * A scheduled function that runs every 5 minutes to monitor A/B test performance.
 */
exports.monitorABTestPerformance = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('Monitoring A/B test performance...');
    // TODO:
    // - Calculate conversion rates per variant
    // - Check statistical significance
    // - Auto-pause if one variant significantly underperforms
    // - Send alerts for test milestones
  });

/**
 * Process complex queries asynchronously.
 */
exports.processComplexQuery = functions.https.onCall(async (data, context) => {
    // TODO:
    // - Validate user permissions
    // - Process query with Gemini
    // - Cache results
    // - Return insights
});

/**
 * Generate scheduled insights.
 */
exports.generateDailyInsights = functions.pubsub
    .schedule('every day 09:00')
    .onRun(async (context) => {
        // TODO:
        // - Analyze yesterday's data
        // - Identify anomalies
        // - Generate insights
        // - Send notifications
    });

/**
 * Real-time anomaly detection.
 */
exports.detectAnomalies = functions.firestore
    .document('events/{eventId}')
    .onCreate(async (snap, context) => {
        // TODO:
        // - Check for unusual patterns
        // - Alert if anomaly detected
        // - Suggest investigation queries
    });
