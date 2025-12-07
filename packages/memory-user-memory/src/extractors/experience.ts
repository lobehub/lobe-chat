import { renderPlaceholderTemplate } from '@lobechat/context-engine';
import { z } from 'zod';

import {
  ExperienceMemory,
  ExperienceMemorySchema,
  MEMORY_CATEGORIES,
  MemoryTypeEnum,
} from '../schemas';
import { ExtractorTemplateProps } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';
import { BaseMemoryExtractor } from './base';

export class ExperienceExtractor extends BaseMemoryExtractor<ExperienceMemory> {
  getPromptFileName(): string {
    return 'layers/experience.md';
  }

  getSchema() {
    const categories = MEMORY_CATEGORIES;
    const categoriesEnum = z.enum(categories);

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
  }

  getResultSchema() {
    return ExperienceMemorySchema;
  }

  getTemplateProps(options: ExtractorTemplateProps) {
    return {
      availableCategories: options.availableCategories,
      language: options.language,
      retrievedContext: options.retrievedContexts?.join('\n\n') || 'No similar memories retrieved.',
      sessionDate: options.sessionDate,
      topK: options.topK,
      username: options.username,
    };
  }

  buildUserPrompt(options: ExtractorTemplateProps): string {
    if (!this.promptTemplate) {
      throw new Error('Prompt template not loaded');
    }

    return renderPlaceholderTemplate(this.promptTemplate!, this.getTemplateProps(options));
  }
}
