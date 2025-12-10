import { z } from 'zod';

import { MemoryTypeSchema } from './common';
import { LayersEnum, UserMemoryContextObjectType, UserMemoryContextSubjectType } from '@/types/userMemory';

export const AssociatedObjectSchema = z.object({
  extra:z.string().nullable().describe('Additional metadata about the object'),
  name: z.string().describe('Name of the associated object'),
  type: z.nativeEnum(UserMemoryContextObjectType).describe('Type/category of the associated object'),
})

export const AssociatedSubjectSchema = z.object({
  extra:z.string().nullable().describe('Additional metadata about the subject'),
  name: z.string().describe('Name of the associated subject'),
  type: z.nativeEnum(UserMemoryContextSubjectType).describe('Type/category of the associated subject'),
})

/**
 * Context-specific fields
 */
export const WithContextSchema = z.object({
  associatedObjects: z
    .array(AssociatedObjectSchema)
    .describe('Array of objects describing involved roles, entities, or resources, [] empty if none'),
  associatedSubjects: z
    .array(AssociatedSubjectSchema)
    .describe('Array of JSON objects describing involved subjects or participants, [] empty if none'),
  currentStatus: z
    .string()
    .describe("High level status markers (e.g., 'active', 'pending')"),
  description: z
    .string()
    .describe('Rich narrative describing the situation, timeline, or environment'),
  labels: z
    .array(z.string())
    .describe('Model generated tags that summarize the context themes'),
  scoreImpact: z
    .number()
    .describe('Numeric score (0-1 or domain-specific) describing importance'),
  scoreUrgency: z
    .number()
    .describe('Numeric score (0-1 or domain-specific) describing urgency'),
  title: z.string().describe('Optional synthesized context headline'),
  type: z
    .string()
    .describe("High level context archetype (e.g., 'project', 'relationship', 'goal')"),
});

/**
 * Single context memory item
 */
export const ContextMemoryItemSchema = z.object({
  details: z.string().describe('Optional detailed information'),
  memoryCategory: z.string().describe('Memory category'),
  memoryLayer: z.literal(LayersEnum.Context).describe('Memory layer'),
  memoryType: MemoryTypeSchema.describe('Memory type'),
  summary: z.string().describe('Concise overview of this specific memory'),
  tags: z.array(z.string()).describe('User defined tags that summarize the context facets'),
  title: z.string().describe('Brief descriptive title'),
  withContext: WithContextSchema,
});

/**
 * Context memory extraction result
 */
export const ContextMemorySchema = z.object({
  memories: z.array(ContextMemoryItemSchema),
});

export type WithContext = z.infer<typeof WithContextSchema>;
export type ContextMemoryItem = z.infer<typeof ContextMemoryItemSchema>;
export type ContextMemory = z.infer<typeof ContextMemorySchema>;
