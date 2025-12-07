import { renderPlaceholderTemplate } from '@lobechat/context-engine';
import { z } from 'zod';

import { ContextMemory, ContextMemorySchema, MEMORY_CATEGORIES, MemoryTypeEnum } from '../schemas';
import { ExtractorTemplateProps } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';
import { BaseMemoryExtractor } from './base';

export class ContextExtractor extends BaseMemoryExtractor<ContextMemory> {
  getPromptFileName(): string {
    return 'layers/context.md';
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
            memoryLayer: z.literal('context').describe('Memory layer'),
            memoryType: MemoryTypeEnum.describe('Memory type'),
            summary: z.string().describe('Concise overview of this specific memory'),
            title: z.string().describe('Brief descriptive title'),
            withContext: z
              .object({
                associatedObjects: z
                  .array(z.string())
                  .describe('describing involved roles, entities, or resources'),
                associatedSubjects: z
                  .array(z.string())
                  .describe('describing involved roles, entities, or resources'),
                currentStatus: z
                  .string()
                  .nullable()
                  .describe("High level status markers (e.g., 'active', 'pending')"),
                description: z
                  .string()
                  .describe('Rich narrative describing the situation, timeline, or environment'),
                labels: z
                  .array(z.string())
                  .describe('Model generated tags that summarize the context themes'),
                scoreImpact: z
                  .number()
                  .nullable()
                  .describe('Numeric score (0-1 or domain-specific) describing importance'),
                scoreUrgency: z
                  .number()
                  .nullable()
                  .describe('Numeric score (0-1 or domain-specific) describing urgency'),
                title: z.string().nullable().describe('Optional synthesized context headline'),
                type: z
                  .string()
                  .nullable()
                  .describe(
                    "High level context archetype (e.g., 'project', 'relationship', 'goal')",
                  ),
              })
              .strict(),
          }),
        ),
      }),
      { name: 'context_extraction' },
    );
  }

  getResultSchema() {
    return ContextMemorySchema;
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
