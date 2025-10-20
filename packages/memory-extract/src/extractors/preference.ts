import { GenerateObjectSchema } from '@lobechat/model-runtime';

import { BaseMemoryExtractor, ExtractorOptions } from '../base-extractor';
import {
  MEMORY_CATEGORIES,
  MEMORY_TYPES,
  PreferenceMemory,
  PreferenceMemorySchema,
} from '../types';

const createPreferenceSchema = (categories: readonly string[]): GenerateObjectSchema => ({
  name: 'preference_extraction',
  schema: {
    additionalProperties: false,
    properties: {
      memories: {
        items: {
          additionalProperties: false,
          properties: {
            details: {
              description: 'Optional detailed information',
              type: 'string',
            },
            memoryCategory: {
              description: 'Memory category',
              enum: categories,
              type: 'string',
            },
            memoryLayer: {
              description: 'Memory layer',
              enum: ['preference'],
              type: 'string',
            },
            memoryType: {
              description: 'Memory type',
              enum: MEMORY_TYPES,
              type: 'string',
            },
            summary: {
              description: 'Concise overview of this specific memory',
              type: 'string',
            },
            title: {
              description: 'Brief descriptive title',
              type: 'string',
            },
            withPreference: {
              additionalProperties: false,
              properties: {
                appContext: {
                  additionalProperties: false,
                  description: 'Application/surface specific preference, if any',
                  properties: {
                    app: {
                      description: 'App or product name this applies to',
                      type: ['string', 'null'],
                    },
                    feature: { type: ['string', 'null'] },
                    route: { type: ['string', 'null'] },
                    surface: {
                      description: 'e.g., chat, emails, code review, notes',
                      type: ['string', 'null'],
                    },
                  },
                  required: ['app', 'surface', 'feature', 'route'],
                  type: 'object',
                },
                conclusionDirectives: {
                  description:
                    "Direct, self-contained instruction to the assistant from the user's perspective (what to do, not how to implement)",
                  type: 'string',
                },
                extractedLabels: {
                  description: 'Model generated tags that summarize the preference facets',
                  items: { type: 'string' },
                  type: 'array',
                },
                extractedScopes: {
                  description: 'describing preference facets and applicable scopes',
                  items: { type: 'string' },
                  type: 'array',
                },
                originContext: {
                  additionalProperties: false,
                  description: 'Context of how/why this preference was expressed',
                  properties: {
                    actor: {
                      description: "Who stated the preference; use 'User' for the user",
                      type: ['string', 'null'],
                    },
                    applicableWhen: {
                      description: 'Conditions where this preference applies',
                      type: ['string', 'null'],
                    },
                    notApplicableWhen: {
                      description: 'Conditions where it does not apply',
                      type: ['string', 'null'],
                    },
                    scenario: {
                      description: 'Applicable scenario or use case',
                      type: ['string', 'null'],
                    },
                    trigger: {
                      description: 'What prompted this preference',
                      type: ['string', 'null'],
                    },
                  },
                  required: ['actor', 'trigger', 'scenario', 'applicableWhen', 'notApplicableWhen'],
                  type: 'object',
                },
                scorePriority: {
                  description:
                    'Numeric prioritization weight where higher means more critical to respect',
                  type: ['number', 'null'],
                },
                suggestions: {
                  description:
                    'Follow-up actions or assistant guidance derived from the preference',
                  items: { type: 'string' },
                  type: 'array',
                },
                type: {
                  description:
                    "High level preference classification (e.g., 'lifestyle', 'communication')",
                  type: ['string', 'null'],
                },
              },
              required: [
                'conclusionDirectives',
                'extractedLabels',
                'extractedScopes',
                'type',
                'scorePriority',
                'suggestions',
                'appContext',
                'originContext',
              ],
              type: 'object',
            },
          },
          required: [
            'title',
            'details',
            'summary',
            'memoryLayer',
            'memoryType',
            'memoryCategory',
            'withPreference',
          ],
          type: 'object',
        },
        type: 'array',
      },
    },
    required: ['memories'],
    type: 'object' as const,
  },
  strict: true,
});

/**
 * Preference Memory Extractor
 * Extracts durable user choices and behavioral directives
 */
export class PreferenceExtractor extends BaseMemoryExtractor<PreferenceMemory> {
  protected getPromptFileName(): string {
    return 'layers/preference.md';
  }

  protected getSchema(options: ExtractorOptions): GenerateObjectSchema {
    const categories = options.availableCategories || MEMORY_CATEGORIES;
    return createPreferenceSchema(categories);
  }

  protected getResultSchema() {
    return PreferenceMemorySchema;
  }

  protected getTemplateProps(options: ExtractorOptions): Record<string, any> {
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
