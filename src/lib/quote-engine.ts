import type { FormData } from "@/types";

export function calculateQuote(formData: FormData): number {
  let basePrice = 50; // Base monthly price

  // Insurance type adjustment
  switch (formData.insuranceType) {
    case 'home':
      basePrice += 20;
      break;
    case 'vehicle':
      basePrice += 15;
      break;
    case 'business':
      basePrice += 50;
      break;
    case 'landlord':
      basePrice += 30;
      break;
    default:
      basePrice += 10;
  }

  // Vehicle age adjustment
  if (formData.vehicleYear) {
    if (formData.vehicleYear.includes('newer')) basePrice += 10;
    if (formData.vehicleYear.includes('older')) basePrice -= 5;
  }

  // Home security adjustment
  if (formData.securitySystems) {
    if (formData.securitySystems === 'yes') basePrice -= 5;
    if (formData.securitySystems === 'no') basePrice += 5;
  }

  // Claims history adjustment
  if (formData.previousClaims) {
    if (formData.previousClaims === 'yes') basePrice += 15;
    if (formData.previousClaims === 'no') basePrice -= 5; // No-claims bonus
  }

  // Coverage level adjustment
  if (formData.coverageLevel) {
    if (formData.coverageLevel === 'basic') basePrice -= 10;
    if (formData.coverageLevel === 'comprehensive') basePrice += 10;
    if (formData.coverageLevel === 'premium') basePrice += 25;
  }
  
  // Excess adjustment
  if (formData.excessAmount) {
      if (formData.excessAmount.includes('250-500')) basePrice += 10;
      if (formData.excessAmount.includes('1000+')) basePrice -= 10;
  }

  // Age group adjustment
  if (formData.ageGroup) {
      if (formData.ageGroup.includes('18-25')) basePrice += 15; // Higher risk
      if (formData.ageGroup.includes('41-60')) basePrice -= 5; // Lower risk
      if (formData.ageGroup.includes('60+')) basePrice -= 3;
  }

  return Math.round(basePrice);
}
