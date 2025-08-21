"use server";

import { coverageRecommendation } from "@/ai/flows/coverage-recommendation";
import type { FormData } from "@/types";

/**
 * In a real application, this would save the quote data to a database like Firestore.
 * For this example, we'll just log it to the console.
 */
export async function submitQuote(formData: FormData) {
  console.log("Quote submitted:", formData);
  // Example: await db.collection('quotes').add(formData);
  return { success: true, quoteId: `q_${Date.now()}` };
}

/**
 * Wraps the Genkit AI flow to be called as a server action from client components.
 */
export async function getCoverageRecommendation(formData: FormData) {
  try {
    // Construct a profile summary from the form data for the AI prompt
    const riskProfile = `
      Insurance Type: ${formData.insuranceType || 'Not specified'}
      ${formData.insuranceType === 'home' ? `Property Type: ${formData.homePropertyType || 'N/A'}`: ''}
      ${formData.insuranceType === 'vehicle' ? `Vehicle Year: ${formData.vehicleYear || 'N/A'}`: ''}
      Security: ${formData.securitySystems || 'Not specified'}
      Claim History: ${formData.previousClaims || 'Not specified'}
      Age Group: ${formData.ageGroup || 'Not specified'}
    `;

    const budget = `Preferred Excess: ${formData.excessAmount || 'Not specified'}`;
    const preferences = `Wants coverage to start: ${formData.coverageStartDate || 'Not specified'}`;

    const recommendation = await coverageRecommendation({
      riskProfile,
      budget,
      preferences,
    });
    
    return { success: true, data: recommendation };
  } catch (error) {
    console.error("Error getting coverage recommendation:", error);
    return {
      success: false,
      error: "We couldn't generate a recommendation at this time. Please select a coverage level manually.",
    };
  }
}
