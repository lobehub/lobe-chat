import { z } from 'zod';

import { MemoryTypeEnum } from './common';

/**
 * Context-specific fields
 */
export const WithContextSchema = z.object({
  associatedObjects: z
    .array(z.string())
    .optional()
    .describe('Array of JSON strings describing involved roles, entities, or resources'),
  associatedSubjects: z
    .array(z.string())
    .optional()
    .describe('Array of JSON strings describing involved roles, entities, or resources'),
  currentStatus: z
    .string()
    .optional()
    .describe("High level status markers (e.g., 'active', 'pending')"),
  description: z
    .string()
    .optional()
    .describe('Rich narrative describing the situation, timeline, or environment'),
  extractedLabels: z
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
  memoryLayer: z.literal('context').describe('Memory layer'),
  memoryType: MemoryTypeEnum.describe('Memory type'),
  summary: z.string().describe('Concise overview of this specific memory'),
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
