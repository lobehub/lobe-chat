import { z } from 'zod';

import { ContextMemory, ContextMemorySchema, MEMORY_CATEGORIES, MemoryTypeEnum } from '../schemas';
import { ExtractorOptions } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';
import { BaseMemoryExtractor } from './base';

const createContextSchema = (categories: readonly string[]) => {
  const categoriesEnum = z.enum(categories as [string, ...string[]]);

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
                .describe("High level context archetype (e.g., 'project', 'relationship', 'goal')"),
            })
            .strict(),
        }),
      ),
    }),
    { name: 'context_extraction' },
  );
};

export class ContextExtractor extends BaseMemoryExtractor<ContextMemory> {
  protected getPromptFileName(): string {
    return 'layers/context.md';
  }

  protected getSchema(options: ExtractorOptions) {
    const categories = options.availableCategories?.length
      ? options.availableCategories
      : MEMORY_CATEGORIES;

    return createContextSchema(categories);
  }

  protected getResultSchema() {
    return ContextMemorySchema;
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
      'Extract context information from the conversation. Return structured data according to the schema.',
    ].join('\n');
  }
}
