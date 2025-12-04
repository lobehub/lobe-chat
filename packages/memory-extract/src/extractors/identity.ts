import { ChatCompletionTool } from '@lobechat/model-runtime';

import { BaseMemoryExtractor, ExtractorOptions } from '../base-extractor';
import { IdentityMemory, IdentityMemorySchema } from '../types';

export interface IdentityExtractorOptions extends ExtractorOptions {
  existingIdentitiesContext?: string;
}

const RELATIONSHIP_ENUM = [
  'self',
  'father',
  'mother',
  'son',
  'daughter',
  'brother',
  'sister',
  'sibling',
  'husband',
  'wife',
  'spouse',
  'partner',
  'couple',
  'friend',
  'colleague',
  'coworker',
  'classmate',
  'mentor',
  'mentee',
  'manager',
  'teammate',
  'grandfather',
  'grandmother',
  'grandson',
  'granddaughter',
  'uncle',
  'aunt',
  'nephew',
  'niece',
  'other',
];

/**
 * Identity tool names
 */
export const IdentityToolName = {
  addIdentity: 'addIdentity',
  removeIdentity: 'removeIdentity',
  updateIdentity: 'updateIdentity',
};

/**
 * Identity tools for CRUD operations on identity entries
 */
const IdentityTools = [
  {
    description: 'Add a new identity entry for the user',
    name: IdentityToolName.addIdentity,
    parameters: {
      additionalProperties: false,
      properties: {
        description: {
          description:
            "Rich narrative describing the person's background, roles, and attributes (required)",
          type: 'string',
        },
        episodicDate: {
          description:
            'Optional ISO 8601 timestamp describing when this identity aspect is most relevant',
          type: ['string', 'null'],
        },
        extractedLabels: {
          description: 'Model generated tags that summarize the identity facets',
          items: { type: 'string' },
          type: 'array',
        },
        relationship: {
          description:
            "Relationship of this identity to the user. Use 'self' when the identity is the user themself",
          enum: RELATIONSHIP_ENUM,
          type: ['string', 'null'],
        },
        role: {
          description:
            "Short role label (e.g., 'software engineer', 'student', 'manager', 'mentor')",
          type: ['string', 'null'],
        },
        scoreConfidence: {
          description: 'Model confidence (0-1) that this identity aspect is correct',
          type: ['number', 'null'],
        },
        sourceEvidence: {
          description: 'Optional short quote or pointer to evidence in the current conversation',
          type: ['string', 'null'],
        },
        type: {
          description: 'High level identity archetype',
          enum: ['professional', 'personal', 'demographic'],
          type: ['string'],
        },
      },
      required: ['description'],
      type: 'object',
    },
  },
  {
    description: 'Update an existing identity entry',
    name: IdentityToolName.updateIdentity,
    parameters: {
      additionalProperties: false,
      properties: {
        id: {
          description: 'The ID of the identity entry to update',
          type: 'string',
        },
        mergeStrategy: {
          description: 'replace: overwrite all fields; merge: update only provided fields',
          enum: ['replace', 'merge'],
          type: 'string',
        },
        set: {
          description: 'Fields to update',
          properties: {
            description: { type: 'string' },
            episodicDate: { type: ['string', 'null'] },
            extractedLabels: { items: { type: 'string' }, type: 'array' },
            relationship: { enum: RELATIONSHIP_ENUM, type: ['string', 'null'] },
            role: { type: ['string', 'null'] },
            scoreConfidence: { type: ['number', 'null'] },
            sourceEvidence: { type: ['string', 'null'] },
            type: { type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      required: ['id', 'set', 'mergeStrategy'],
      type: 'object',
    },
  },
  {
    description: 'Remove an identity entry that is incorrect, obsolete, or duplicate',
    name: IdentityToolName.removeIdentity,
    parameters: {
      additionalProperties: false,
      properties: {
        id: {
          description: 'The ID of the identity entry to remove',
          type: 'string',
        },
        reason: {
          description: 'Brief reasoning: incorrect, obsolete, or duplicate',
          type: 'string',
        },
      },
      required: ['id', 'reason'],
      type: 'object',
    },
  },
];

/**
 * Identity Memory Extractor using tools calling
 * Extracts information about actors, relationships, and personal attributes
 */
export class IdentityExtractor extends BaseMemoryExtractor<
  IdentityMemory,
  IdentityExtractorOptions
> {
  protected getPromptFileName(): string {
    return 'layers/identity.md';
  }

  protected getTools(): ChatCompletionTool[] {
    return IdentityTools.map((tool) => ({
      function: tool,
      type: 'function',
    }));
  }

  protected getResultSchema() {
    return IdentityMemorySchema;
  }

  protected getTemplateProps(options: IdentityExtractorOptions): Record<string, any> {
    return {
      availableCategories: options.availableCategories,
      existingIdentitiesContext: options.existingIdentitiesContext,
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
      '',
      'Extract identity information by calling the appropriate CRUD tools:',
      '- Use addIdentityEntry for genuinely new identity aspects',
      '- Use updateIdentityEntry when details of an existing entry change',
      '- Use removeIdentityEntry for incorrect, obsolete, or duplicated entries',
      '',
      'Call each tool multiple times as needed. Prefer updating existing entries over adding new ones to avoid duplication.',
    ].join('\n');
  }
}
