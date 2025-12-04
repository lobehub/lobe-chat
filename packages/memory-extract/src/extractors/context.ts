import { GenerateObjectSchema } from '@lobechat/model-runtime';

import { BaseMemoryExtractor, ExtractorOptions } from '../base-extractor';
import { ContextMemory, ContextMemorySchema, MEMORY_CATEGORIES, MEMORY_TYPES } from '../types';

const createContextSchema = (categories: readonly string[]): GenerateObjectSchema => ({
  name: 'context_extraction',
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
              enum: ['context'],
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
            withContext: {
              additionalProperties: false,
              properties: {
                associatedObjects: {
                  description: 'describing involved roles, entities, or resources',
                  items: { type: 'string' },
                  type: 'array',
                },
                associatedSubjects: {
                  description: 'describing involved roles, entities, or resources',
                  items: { type: 'string' },
                  type: 'array',
                },
                currentStatus: {
                  description: "High level status markers (e.g., 'active', 'pending')",
                  type: ['string', 'null'],
                },
                description: {
                  description: 'Rich narrative describing the situation, timeline, or environment',
                  type: 'string',
                },
                extractedLabels: {
                  description: 'Model generated tags that summarize the context themes',
                  items: { type: 'string' },
                  type: 'array',
                },
                scoreImpact: {
                  description: 'Numeric score (0-1 or domain-specific) describing importance',
                  type: ['number', 'null'],
                },
                scoreUrgency: {
                  description: 'Numeric score (0-1 or domain-specific) describing urgency',
                  type: ['number', 'null'],
                },
                title: {
                  description: 'Optional synthesized context headline',
                  type: ['string', 'null'],
                },
                type: {
                  description:
                    "High level context archetype (e.g., 'project', 'relationship', 'goal')",
                  type: ['string', 'null'],
                },
              },
              required: [
                'description',
                'extractedLabels',
                'associatedSubjects',
                'associatedObjects',
                'type',
                'currentStatus',
                'title',
                'scoreImpact',
                'scoreUrgency',
              ],
              type: 'object',
            },
          },
          required: [
            'title',
            'summary',
            'memoryLayer',
            'memoryType',
            'memoryCategory',
            'withContext',
            'details',
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
 * Context Memory Extractor
 * Extracts situational frameworks and ongoing situations
 */
export class ContextExtractor extends BaseMemoryExtractor<ContextMemory> {
  protected getPromptFileName(): string {
    return 'layers/context.md';
  }

  protected getSchema(options: ExtractorOptions): GenerateObjectSchema {
    const categories = options.availableCategories || MEMORY_CATEGORIES;
    return createContextSchema(categories);
  }

  protected getResultSchema() {
    return ContextMemorySchema;
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
      'Extract context information from the conversation. Return structured data according to the schema.',
    ].join('\n');
  }
}
