'use server';

/**
 * @fileOverview Implements the Intelligent Format Conversion flow.
 *
 * This flow is responsible for intelligently selecting an alternative format
 * if the user's desired video or audio format isn't available for download.
 *
 * - intelligentFormatConversion - The main function for the flow.
 * - IntelligentFormatConversionInput - The input type for the flow.
 * - IntelligentFormatConversionOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentFormatConversionInputSchema = z.object({
  requestedFormat: z.string().describe('The video or audio format requested by the user (e.g., MP4, MP3).'),
  availableFormats: z.array(z.string()).describe('The formats actually available for the video.'),
});

export type IntelligentFormatConversionInput = z.infer<typeof IntelligentFormatConversionInputSchema>;

const IntelligentFormatConversionOutputSchema = z.object({
  selectedFormat: z.string().describe('The format selected for download.'),
  reason: z.string().describe('The reason for selecting this format.'),
});

export type IntelligentFormatConversionOutput = z.infer<typeof IntelligentFormatConversionOutputSchema>;

export async function intelligentFormatConversion(
  input: IntelligentFormatConversionInput
): Promise<IntelligentFormatConversionOutput> {
  return intelligentFormatConversionFlow(input);
}

const intelligentFormatConversionPrompt = ai.definePrompt({
  name: 'intelligentFormatConversionPrompt',
  input: {schema: IntelligentFormatConversionInputSchema},
  output: {schema: IntelligentFormatConversionOutputSchema},
  prompt: `You are an AI assistant helping a user download a YouTube video.

The user requested the following format: {{{requestedFormat}}}

The available formats are: {{#each availableFormats}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Given that the requested format may not be available, select an appropriate alternative format, considering factors such as quality and compatibility. Explain your reasoning for the selection.

Ensure that the output is valid JSON that conforms to the schema. The selectedFormat MUST be one of the availableFormats.
`,
});

const intelligentFormatConversionFlow = ai.defineFlow(
  {
    name: 'intelligentFormatConversionFlow',
    inputSchema: IntelligentFormatConversionInputSchema,
    outputSchema: IntelligentFormatConversionOutputSchema,
  },
  async input => {
    const {output} = await intelligentFormatConversionPrompt(input);
    return output!;
  }
);
