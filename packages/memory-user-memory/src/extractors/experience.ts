import { z } from 'zod';

import {
  ExperienceMemory,
  ExperienceMemorySchema,
  MEMORY_CATEGORIES,
  MemoryTypeEnum,
} from '../schemas';
import { ExtractorOptions } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';
import { BaseMemoryExtractor } from './base';

const createExperienceSchema = (categories: readonly string[]) => {
  const categoriesEnum = z.enum(categories as [string, ...string[]]);

  return buildGenerateObjectSchema(
    z.object({
      memories: z.array(
        z.object({
          details: z.string().describe('Optional detailed information'),
          memoryCategory: categoriesEnum.describe('Memory category'),
          memoryLayer: z.literal('experience').describe('Memory layer'),
          memoryType: MemoryTypeEnum.describe('Memory type'),
          summary: z.string().describe('Concise overview of this specific memory'),
          title: z.string().describe('Brief descriptive title'),
          withExperience: z
            .object({
              action: z
                .string()
                .nullable()
                .describe('Narrative describing actions taken or behaviors exhibited'),
              keyLearning: z
                .string()
                .nullable()
                .describe('Narrative describing key insights or lessons learned'),
              labels: z
                .array(z.string())
                .describe('Model generated tags that summarize the experience facets'),
              possibleOutcome: z
                .string()
                .nullable()
                .describe('Narrative describing potential outcomes or learnings'),
              reasoning: z
                .string()
                .nullable()
                .describe('Narrative describing the thought process or motivations'),
              scoreConfidence: z
                .number()
                .nullable()
                .describe(
                  'Numeric score (0-1 or domain-specific) describing confidence in the experience details',
                ),
              situation: z
                .string()
                .nullable()
                .describe('Narrative describing the situation or event'),
            })
            .strict(),
        }),
      ),
    }),
    { name: 'experience_extraction' },
  );
};

export class ExperienceExtractor extends BaseMemoryExtractor<ExperienceMemory> {
  protected getPromptFileName(): string {
    return 'layers/experience.md';
  }

  protected getSchema(options: ExtractorOptions) {
    const categories = options.availableCategories?.length
      ? options.availableCategories
      : MEMORY_CATEGORIES;

    return createExperienceSchema(categories);
  }

  protected getResultSchema() {
    return ExperienceMemorySchema;
  }

  protected getTemplateProps(options: ExtractorOptions) {
    return {
      availableCategories: options.availableCategories,
      language: options.language,
      retrievedContext: options.retrievedContext,
      sessionDate: options.sessionDate,
      topK: options.topK,
      username: options.username,
    };
  }

  protected buildUserPrompt(conversationText: string): string {
    return [
      'Conversation to Analyze:',
      '---',
      conversationText,
      '---',
      'Extract experience information from the conversation. Return structured data according to the schema.',
    ].join('\n');
  }
}
