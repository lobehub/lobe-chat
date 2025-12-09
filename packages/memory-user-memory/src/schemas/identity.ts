import { z } from 'zod';

import { MemoryTypeEnum } from './common';

export const RELATIONSHIP_ENUM = [
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

const AddIdentityActionSchema = z
  .object({
    description: z.string(),
    episodicDate: z.string().nullable().optional(),
    extractedLabels: z.array(z.string()).optional(),
    relationship: RelationshipEnum.nullable().optional(),
    role: z.string().nullable().optional(),
    scoreConfidence: z.number().nullable().optional(),
    sourceEvidence: z.string().nullable().optional(),
    type: IdentityTypeEnum,
  })
  .strict();

const UpdateIdentityActionSchema = z
  .object({
    id: z.string(),
    mergeStrategy: MergeStrategyEnum,
    set: z
      .object({
        description: z.string().optional(),
        episodicDate: z.string().nullable().optional(),
        extractedLabels: z.array(z.string()).optional(),
        relationship: RelationshipEnum.nullable().optional(),
        role: z.string().nullable().optional(),
        scoreConfidence: z.number().nullable().optional(),
        sourceEvidence: z.string().nullable().optional(),
        type: IdentityTypeEnum.nullable().optional(),
      })
      .strict(),
  })
  .strict();

const RemoveIdentityActionSchema = z
  .object({
    id: z.string(),
    reason: z.string(),
  })
  .strict();

const IdentityActionsSchema = z
  .object({
    add: z.array(AddIdentityActionSchema).nullable(),
    remove: z.array(RemoveIdentityActionSchema).nullable(),
    update: z.array(UpdateIdentityActionSchema).nullable(),
  })
  .strict();

export const IdentityMemorySchema = z
  .object({
    details: z.string().optional().describe('Optional detailed information'),
    memoryCategory: z.string().describe('Memory category'),
    memoryLayer: z.literal('context').describe('Memory layer'),
    memoryType: MemoryTypeEnum.describe('Memory type'),
    summary: z.string().describe('Concise overview of this specific memory'),
    title: z.string().describe('Brief descriptive title'),
    withIdentities: z
      .object({
        actions: IdentityActionsSchema,
      })
      .strict(),
  })
  .strict();

export type IdentityMemory = z.infer<typeof IdentityMemorySchema>;
export type IdentityActions = z.infer<typeof IdentityActionsSchema>;
export type AddIdentityAction = z.infer<typeof AddIdentityActionSchema>;
export type UpdateIdentityAction = z.infer<typeof UpdateIdentityActionSchema>;
export type RemoveIdentityAction = z.infer<typeof RemoveIdentityActionSchema>;
