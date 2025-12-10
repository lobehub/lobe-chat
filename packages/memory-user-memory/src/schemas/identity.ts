import { z } from 'zod';

import { MemoryTypeSchema } from './common';
import { LayersEnum, MergeStrategyEnum } from '@/types/userMemory';

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

export const AddIdentityActionSchema = z
  .object({
    details: z.union([z.string(), z.null()]).describe('Optional detailed information'),
    memoryCategory: z.string().describe('Memory category'),
    memoryLayer: z.literal(LayersEnum.Identity).describe('Memory layer'),
    memoryType: MemoryTypeSchema.describe('Memory type'),
    summary: z.string().describe('Concise overview of this specific memory'),
    tags: z.array(z.string()).describe('Model generated tags that summarize the identity facets'),
    title: z.string().describe('Brief descriptive title'),
    withIdentity: z
      .object({
        description: z.string(),
        episodicDate: z.union([z.string(), z.null()]),
        extractedLabels: z.array(z.string()),
        relationship: RelationshipEnum,
        role: z.string(),
        scoreConfidence: z.number(),
        sourceEvidence: z.union([z.string(), z.null()]),
        type: IdentityTypeEnum,
      })
      .strict(),
  })
  .strict()

export const UpdateIdentityActionSchema = z
  .object({
    id: z.string(),
    mergeStrategy: z.nativeEnum(MergeStrategyEnum),
    set: z.object({
      details: z.union([z.string(), z.null()]).describe('Optional detailed information, use null for omitting the field'),
      memoryCategory: z.union([z.string(), z.null()]).describe('Memory category, use null for omitting the field'),
      memoryType: z.union([MemoryTypeSchema, z.null()]).describe('Memory type, use null for omitting the field'),
      summary: z.union([z.string(), z.null()]).describe('Concise overview of this specific memory, use null for omitting the field'),
      tags: z.union([z.array(z.string()), z.null()]).describe('Model generated tags that summarize the identity facets, use null for omitting the field'),
      title: z.union([z.string(), z.null()]).describe('Brief descriptive title, use null for omitting the field'),
      withIdentity: z
        .object({
          description: z.union([z.string(), z.null()]),
          episodicDate: z.union([z.string(), z.null()]),
          extractedLabels: z.union([z.array(z.string()), z.null()]),
          relationship: z.union([RelationshipEnum, z.null()]),
          role: z.union([z.string(), z.null()]),
          scoreConfidence: z.union([z.number(), z.null()]),
          sourceEvidence: z.union([z.string(), z.null()]),
          type: z.union([IdentityTypeEnum, z.null()]),
        })
        .strict(),
    })
  })
  .strict();

export const RemoveIdentityActionSchema = z
  .object({
    id: z.string(),
    reason: z.string(),
  })
  .strict();

export const IdentityActionsSchema = z
  .object({
    add: z.array(AddIdentityActionSchema),
    remove: z.array(RemoveIdentityActionSchema),
    update: z.array(UpdateIdentityActionSchema),
  })
  .strict();

export const WithIdentitySchema = z
  .object({
    actions: IdentityActionsSchema,
  })
  .strict()

export type IdentityActions = z.infer<typeof IdentityActionsSchema>;
export type AddIdentityAction = z.infer<typeof AddIdentityActionSchema>;
export type UpdateIdentityAction = z.infer<typeof UpdateIdentityActionSchema>;
export type RemoveIdentityAction = z.infer<typeof RemoveIdentityActionSchema>;
