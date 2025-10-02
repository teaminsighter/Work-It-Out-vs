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

/**
 * Submit solar quote data to the database
 */
export async function submitSolarQuote(formData: FormData) {
  console.log('Solar quote submitted:', formData);
  
  // In a real application, you would save to your database
  // For now, we'll just return a success response
  try {
    // Example database save:
    // await prisma.lead.create({
    //   data: {
    //     firstName: formData.firstName,
    //     lastName: formData.lastName,
    //     email: formData.email,
    //     phone: formData.phone,
    //     source: 'solar_calculator',
    //     systemDetails: {
    //       create: {
    //         address: formData.address,
    //         propertyType: formData['property-type'],
    //         roofType: formData['roof-type'],
    //         // ... other details
    //       }
    //     }
    //   }
    // });
    
    return { success: true, quoteId: `solar_${Date.now()}` };
  } catch (error) {
    console.error('Error submitting solar quote:', error);
    return { success: false, error: 'Failed to submit quote' };
  }
}
