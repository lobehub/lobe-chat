import { z } from 'zod';

import {
  MEMORY_CATEGORIES,
  MemoryTypeEnum,
  PreferenceMemory,
  PreferenceMemorySchema,
} from '../schemas';
import { ExtractorOptions } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';
import { BaseMemoryExtractor } from './base';

const createPreferenceSchema = (categories: readonly string[]) => {
  const categoriesEnum = z.enum(categories as [string, ...string[]]);

  return buildGenerateObjectSchema(
    z.object({
      memories: z.array(
        z.object({
          details: z.string().describe('Optional detailed information'),
          memoryCategory: categoriesEnum.describe('Memory category'),
          memoryLayer: z.literal('preference').describe('Memory layer'),
          memoryType: MemoryTypeEnum.describe('Memory type'),
          summary: z.string().describe('Concise overview of this specific memory'),
          title: z.string().describe('Brief descriptive title'),
          withPreference: z
            .object({
              appContext: z
                .object({
                  app: z.string().nullable().describe('App or product name this applies to'),
                  feature: z.string().nullable(),
                  route: z.string().nullable(),
                  surface: z.string().nullable().describe('e.g., chat, emails, code review, notes'),
                })
                .strict()
                .describe('Application/surface specific preference, if any'),
              conclusionDirectives: z
                .string()
                .describe(
                  "Direct, self-contained instruction to the assistant from the user's perspective (what to do, not how to implement)",
                ),
              extractedScopes: z
                .array(z.string())
                .describe('describing preference facets and applicable scopes'),
              originContext: z
                .object({
                  actor: z
                    .string()
                    .nullable()
                    .describe("Who stated the preference; use 'User' for the user"),
                  applicableWhen: z
                    .string()
                    .nullable()
                    .describe('Conditions where this preference applies'),
                  notApplicableWhen: z
                    .string()
                    .nullable()
                    .describe('Conditions where it does not apply'),
                  scenario: z.string().nullable().describe('Applicable scenario or use case'),
                  trigger: z.string().nullable().describe('What prompted this preference'),
                })
                .strict()
                .describe('Context of how/why this preference was expressed'),
              scorePriority: z
                .number()
                .nullable()
                .describe(
                  'Numeric prioritization weight where higher means more critical to respect',
                ),
              suggestions: z
                .array(z.string())
                .describe('Follow-up actions or assistant guidance derived from the preference'),
              tags: z
                .array(z.string())
                .describe('Model generated tags that summarize the preference facets'),
              type: z
                .string()
                .nullable()
                .describe(
                  "High level preference classification (e.g., 'lifestyle', 'communication')",
                ),
            })
            .strict(),
        }),
      ),
    }),
    { name: 'preference_extraction' },
  );
};

export class PreferenceExtractor extends BaseMemoryExtractor<PreferenceMemory> {
  protected getPromptFileName(): string {
    return 'layers/preference.md';
  }

  protected getSchema(options: ExtractorOptions) {
    const categories = options.availableCategories?.length
      ? options.availableCategories
      : MEMORY_CATEGORIES;

    return createPreferenceSchema(categories);
  }

  protected getResultSchema() {
    return PreferenceMemorySchema;
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
      'Extract preference information from the conversation. Return structured data according to the schema.',
    ].join('\n');
  }
}
