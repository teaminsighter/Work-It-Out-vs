'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing coverage recommendations based on user input.
 *
 * The flow uses AI to analyze user responses and suggest the most suitable coverage option.
 * - coverageRecommendation - A function that handles the coverage recommendation process.
 * - CoverageRecommendationInput - The input type for the coverageRecommendation function.
 * - CoverageRecommendationOutput - The return type for the coverageRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoverageRecommendationInputSchema = z.object({
  riskProfile: z
    .string()
    .describe("The user's risk profile based on their answers to previous questions."),
  budget: z.string().describe('The user’s budget for insurance coverage.'),
  preferences: z
    .string()
    .describe('The user’s coverage preferences, such as desired features and limits.'),
});
export type CoverageRecommendationInput = z.infer<typeof CoverageRecommendationInputSchema>;

const CoverageRecommendationOutputSchema = z.object({
  recommendation: z
    .string()
    .describe('The AI-powered recommendation for the best coverage option.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the recommendation, explaining why it is suitable for the user.'),
});
export type CoverageRecommendationOutput = z.infer<typeof CoverageRecommendationOutputSchema>;

export async function coverageRecommendation(input: CoverageRecommendationInput): Promise<CoverageRecommendationOutput> {
  return coverageRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverageRecommendationPrompt',
  input: {schema: CoverageRecommendationInputSchema},
  output: {schema: CoverageRecommendationOutputSchema},
  prompt: `Based on the user's risk profile, budget, and preferences, provide a coverage recommendation and explain your reasoning.

Risk Profile: {{{riskProfile}}}
Budget: {{{budget}}}
Preferences: {{{preferences}}}

Recommendation:`,
});

const coverageRecommendationFlow = ai.defineFlow(
  {
    name: 'coverageRecommendationFlow',
    inputSchema: CoverageRecommendationInputSchema,
    outputSchema: CoverageRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
