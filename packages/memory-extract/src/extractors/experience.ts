import { GenerateObjectSchema } from '@lobechat/model-runtime';

import { BaseMemoryExtractor, ExtractorOptions } from '../base-extractor';
import {
  ExperienceMemory,
  ExperienceMemorySchema,
  MEMORY_CATEGORIES,
  MEMORY_TYPES,
} from '../types';

const createExperienceSchema = (categories: readonly string[]): GenerateObjectSchema => ({
  name: 'experience_extraction',
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
              enum: ['experience'],
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
            withExperience: {
              additionalProperties: false,
              properties: {
                action: {
                  description: 'Narrative describing actions taken or behaviors exhibited',
                  type: ['string', 'null'],
                },
                extractedLabels: {
                  description: 'Model generated tags that summarize the experience facets',
                  items: { type: 'string' },
                  type: 'array',
                },
                keyLearning: {
                  description: 'Narrative describing key insights or lessons learned',
                  type: ['string', 'null'],
                },
                possibleOutcome: {
                  description: 'Narrative describing potential outcomes or learnings',
                  type: ['string', 'null'],
                },
                reasoning: {
                  description: 'Narrative describing the thought process or motivations',
                  type: ['string', 'null'],
                },
                scoreConfidence: {
                  description:
                    'Numeric score (0-1 or domain-specific) describing confidence in the experience details',
                  type: ['number', 'null'],
                },
                situation: {
                  description: 'Narrative describing the situation or event',
                  type: ['string', 'null'],
                },
              },
              required: [
                'extractedLabels',
                'situation',
                'reasoning',
                'action',
                'possibleOutcome',
                'keyLearning',
                'scoreConfidence',
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
            'withExperience',
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
 * Experience Memory Extractor
 * Extracts learned insights and practical knowledge
 */
export class ExperienceExtractor extends BaseMemoryExtractor<ExperienceMemory> {
  protected getPromptFileName(): string {
    return 'layers/experience.md';
  }

  protected getSchema(options: ExtractorOptions): GenerateObjectSchema {
    const categories = options.availableCategories || MEMORY_CATEGORIES;
    return createExperienceSchema(categories);
  }

  protected getResultSchema() {
    return ExperienceMemorySchema;
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
      'Extract experience information from the conversation. Return structured data according to the schema.',
    ].join('\n');
  }
}
