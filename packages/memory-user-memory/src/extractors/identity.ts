import type { ChatCompletionTool } from '@lobechat/model-runtime';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { IdentityMemory } from '../schemas';
import { ExtractorOptions } from '../types';
import { BaseMemoryExtractor } from './base';

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
] as const;

const RelationshipEnum = z.enum(RELATIONSHIP_ENUM);
const IdentityTypeEnum = z.enum(['professional', 'personal', 'demographic']);
const MergeStrategyEnum = z.enum(['replace', 'merge']);

const AddIdentitySchema = z
  .object({
    description: z
      .string()
      .describe(
        "Rich narrative describing the person's background, roles, and attributes (required)",
      ),
    episodicDate: z
      .string()
      .nullable()
      .describe(
        'Optional ISO 8601 timestamp describing when this identity aspect is most relevant',
      ),
    labels: z.array(z.string()).describe('Model generated tags that summarize the identity facets'),
    relationship: RelationshipEnum.nullable().describe(
      "Relationship of this identity to the user. Use 'self' when the identity is the user themself",
    ),
    role: z
      .string()
      .nullable()
      .describe("Short role label (e.g., 'software engineer', 'student', 'manager', 'mentor')"),
    scoreConfidence: z
      .number()
      .nullable()
      .describe('Model confidence (0-1) that this identity aspect is correct'),
    sourceEvidence: z
      .string()
      .nullable()
      .describe('Optional short quote or pointer to evidence in the current conversation'),
    type: IdentityTypeEnum.describe('High level identity archetype'),
  })
  .strict();

const UpdateIdentitySchema = z
  .object({
    id: z.string().describe('The ID of the identity entry to update'),
    mergeStrategy: MergeStrategyEnum.describe(
      'replace: overwrite all fields; merge: update only provided fields',
    ),
    set: z
      .object({
        description: z.string().optional(),
        episodicDate: z.string().nullable().optional(),
        extractedLabels: z.array(z.string()).optional(),
        relationship: RelationshipEnum.nullable().optional(),
        role: z.string().nullable().optional(),
        scoreConfidence: z.number().nullable().optional(),
        sourceEvidence: z.string().nullable().optional(),
        type: z.string().nullable().optional(),
      })
      .strict()
      .describe('Fields to update'),
  })
  .strict();

const RemoveIdentitySchema = z
  .object({
    id: z.string().describe('The ID of the identity entry to remove'),
    reason: z.string().describe('Brief reasoning: incorrect, obsolete, or duplicate'),
  })
  .strict();

export const IdentityToolName = {
  addIdentity: 'addIdentity',
  removeIdentity: 'removeIdentity',
  updateIdentity: 'updateIdentity',
} as const;

const buildTool = (
  name: string,
  description: string,
  schema: z.ZodTypeAny,
): ChatCompletionTool => ({
  function: {
    description,
    name,
    parameters: zodToJsonSchema(schema),
  },
  type: 'function',
});

const IdentityTools: ChatCompletionTool[] = [
  buildTool(
    IdentityToolName.addIdentity,
    'Add a new identity entry for the user',
    AddIdentitySchema,
  ),
  buildTool(
    IdentityToolName.updateIdentity,
    'Update an existing identity entry',
    UpdateIdentitySchema,
  ),
  buildTool(
    IdentityToolName.removeIdentity,
    'Remove an identity entry that is incorrect, obsolete, or duplicate',
    RemoveIdentitySchema,
  ),
];

export class IdentityExtractor extends BaseMemoryExtractor<
  IdentityMemory,
  IdentityExtractorOptions
> {
  protected getPromptFileName(): string {
    return 'layers/identity.md';
  }

  protected getResultSchema() {
    return undefined;
  }

  protected getTools(): ChatCompletionTool[] {
    return IdentityTools;
  }

  protected getTemplateProps(options: IdentityExtractorOptions) {
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
      '- Use addIdentity for genuinely new identity aspects',
      '- Use updateIdentity when details of an existing entry change',
      '- Use removeIdentity for incorrect, obsolete, or duplicated entries',
      '',
      'Call each tool multiple times as needed. Prefer updating existing entries over adding new ones to avoid duplication.',
    ].join('\n');
  }
}
