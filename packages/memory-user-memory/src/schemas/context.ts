import { z } from 'zod';

import { MemoryTypeSchema } from './common';
import { LayersEnum, UserMemoryContextObjectType, UserMemoryContextSubjectType } from '@/types/userMemory';

export const AssociatedObjectSchema = z.object({
  extra: z.record(z.unknown()).optional().describe('Additional metadata about the object'),
  name: z.string().describe('Name of the associated object'),
  type: z.nativeEnum(UserMemoryContextObjectType).describe('Type/category of the associated object').optional(),
})

export const AssociatedSubjectSchema = z.object({
  extra: z.record(z.unknown()).optional().describe('Additional metadata about the subject'),
  name: z.string().describe('Name of the associated subject'),
  type: z.nativeEnum(UserMemoryContextSubjectType).describe('Type/category of the associated subject').optional(),
})

/**
 * Context-specific fields
 */
export const WithContextSchema = z.object({
  associatedObjects: z
    .array(AssociatedObjectSchema)
    .optional()
    .describe('Array of objects describing involved roles, entities, or resources'),
  associatedSubjects: z
    .array(AssociatedSubjectSchema)
    .optional()
    .describe('Array of JSON objects describing involved subjects or participants'),
  currentStatus: z
    .string()
    .optional()
    .describe("High level status markers (e.g., 'active', 'pending')"),
  description: z
    .string()
    .optional()
    .describe('Rich narrative describing the situation, timeline, or environment'),
  labels: z
    .array(z.string())
    .optional()
    .describe('Model generated tags that summarize the context themes'),
  scoreImpact: z
    .number()
    .nullable()
    .optional()
    .describe('Numeric score (0-1 or domain-specific) describing importance'),
  scoreUrgency: z
    .number()
    .nullable()
    .optional()
    .describe('Numeric score (0-1 or domain-specific) describing urgency'),
  title: z.string().optional().describe('Optional synthesized context headline'),
  type: z
    .string()
    .optional()
    .describe("High level context archetype (e.g., 'project', 'relationship', 'goal')"),
});

/**
 * Single context memory item
 */
export const ContextMemoryItemSchema = z.object({
  details: z.string().optional().describe('Optional detailed information'),
  memoryCategory: z.string().describe('Memory category'),
  memoryLayer: z.literal(LayersEnum.Context).describe('Memory layer'),
  memoryType: MemoryTypeSchema.describe('Memory type'),
  summary: z.string().describe('Concise overview of this specific memory'),
  tags: z.array(z.string()).optional().describe('User defined tags that summarize the context facets'),
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
