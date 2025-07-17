'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing smart catalog suggestions based on user size and gender.
 *
 * The flow takes user's size and gender as input and suggests relevant products.
 * - suggestProducts - A function that handles the product suggestion process.
 * - SmartCatalogInput - The input type for the suggestProducts function.
 * - SmartCatalogOutput - The return type for the suggestProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartCatalogInputSchema = z.object({
  size: z.string().describe('The user\'s size (e.g., S, M, L, XL, 30, 32, etc.).'),
  gender: z.enum(['male', 'female', 'other']).describe('The user\'s gender.'),
});
export type SmartCatalogInput = z.infer<typeof SmartCatalogInputSchema>;

const SmartCatalogOutputSchema = z.object({
  suggestedProducts: z
    .array(z.string())
    .describe('A list of product names that are relevant to the user\'s size and gender.'),
});
export type SmartCatalogOutput = z.infer<typeof SmartCatalogOutputSchema>;

export async function suggestProducts(input: SmartCatalogInput): Promise<SmartCatalogOutput> {
  return suggestProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartCatalogPrompt',
  input: {schema: SmartCatalogInputSchema},
  output: {schema: SmartCatalogOutputSchema},
  prompt: `You are an expert fashion consultant. A user has provided their size and gender.  Based on this information, suggest a list of products that would be relevant to them.

  Size: {{{size}}}
  Gender: {{{gender}}}

  Please return a list of product names.
  `,
});

const suggestProductsFlow = ai.defineFlow(
  {
    name: 'suggestProductsFlow',
    inputSchema: SmartCatalogInputSchema,
    outputSchema: SmartCatalogOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
