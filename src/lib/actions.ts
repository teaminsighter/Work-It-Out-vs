'use server';

import type { FormData } from '@/types';

/**
 * In a real application, this would save the quote data to a database like Firestore.
 * For this example, we'll just log it to the console.
 */
export async function submitQuote(formData: FormData) {
  console.log('Quote submitted:', formData);
  // Example: await db.collection('quotes').add(formData);
  return { success: true, quoteId: `q_${Date.now()}` };
}
