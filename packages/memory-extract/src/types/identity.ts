import { z } from 'zod';

/**
 * Relationship enum for identity
 */
const RelationshipEnum = z.enum([
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
]);

/**
 * Identity type enum
 */
const IdentityTypeEnum = z.enum(['professional', 'personal', 'demographic']);

/**
 * Add identity tool arguments
 */
const AddIdentityArgsSchema = z.object({
  description: z.string(),
  episodicDate: z.string().nullable().optional(),
  extractedLabels: z.array(z.string()).optional(),
  relationship: RelationshipEnum.nullable().optional(),
  role: z.string().nullable().optional(),
  scoreConfidence: z.number().nullable().optional(),
  sourceEvidence: z.string().nullable().optional(),
  type: IdentityTypeEnum.optional(),
});

/**
 * Update identity tool arguments
 */
const UpdateIdentityArgsSchema = z.object({
  id: z.string(),
  mergeStrategy: z.enum(['replace', 'merge']),
  set: z.object({
    description: z.string().optional(),
    episodicDate: z.string().nullable().optional(),
    extractedLabels: z.array(z.string()).optional(),
    relationship: RelationshipEnum.nullable().optional(),
    role: z.string().nullable().optional(),
    scoreConfidence: z.number().nullable().optional(),
    sourceEvidence: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
  }),
});

/**
 * Remove identity tool arguments
 */
const RemoveIdentityArgsSchema = z.object({
  id: z.string(),
  reason: z.string(),
});

/**
 * Identity tool call schema - using discriminated union for type safety
 */
const AddIdentityToolCallSchema = z.object({
  arguments: AddIdentityArgsSchema,
  id: z.string().optional(),
  name: z.literal('addIdentity'),
  type: z.literal('function').optional(),
});

const UpdateIdentityToolCallSchema = z.object({
  arguments: UpdateIdentityArgsSchema,
  id: z.string().optional(),
  name: z.literal('updateIdentity'),
  type: z.literal('function').optional(),
});

const RemoveIdentityToolCallSchema = z.object({
  arguments: RemoveIdentityArgsSchema,
  id: z.string().optional(),
  name: z.literal('removeIdentity'),
  type: z.literal('function').optional(),
});

const IdentityToolCallSchema = z.discriminatedUnion('name', [
  AddIdentityToolCallSchema,
  UpdateIdentityToolCallSchema,
  RemoveIdentityToolCallSchema,
]);

/**
 * Identity memory schema - array of tool calls
 */
export const IdentityMemorySchema = z.array(IdentityToolCallSchema);

export type IdentityMemory = z.infer<typeof IdentityMemorySchema>;
export type AddIdentityArgs = z.infer<typeof AddIdentityArgsSchema>;
export type UpdateIdentityArgs = z.infer<typeof UpdateIdentityArgsSchema>;
export type RemoveIdentityArgs = z.infer<typeof RemoveIdentityArgsSchema>;
