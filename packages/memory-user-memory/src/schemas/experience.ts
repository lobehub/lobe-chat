import { z } from 'zod';

import { MemoryTypeEnum } from './common';

/**
 * Experience-specific fields
 */
export const WithExperienceSchema = z.object({
  action: z
    .string()
    .optional()
    .describe('Narrative describing actions taken or behaviors exhibited'),
  keyLearning: z
    .string()
    .optional()
    .describe('Narrative describing key insights or lessons learned'),
  labels: z
    .array(z.string())
    .optional()
    .describe('Model generated tags that summarize the experience facets'),
  possibleOutcome: z
    .string()
    .optional()
    .describe('Narrative describing potential outcomes or learnings'),
  reasoning: z
    .string()
    .optional()
    .describe('Narrative describing the thought process or motivations'),
  scoreConfidence: z
    .number()
    .optional()
    .describe(
      'Numeric score (0-1 or domain-specific) describing confidence in the experience details',
    ),
  situation: z.string().optional().describe('Narrative describing the situation or event'),
  type: z.string().optional().describe('Type of experience being recorded'),
});

/**
 * Single experience memory item
 */
export const ExperienceMemoryItemSchema = z.object({
  details: z.string().optional().describe('Optional detailed information'),
  memoryCategory: z.string().describe('Memory category'),
  memoryLayer: z.literal('experience').describe('Memory layer'),
  memoryType: MemoryTypeEnum.describe('Memory type'),
  summary: z.string().describe('Concise overview of this specific memory'),
  title: z.string().describe('Brief descriptive title'),
  withExperience: WithExperienceSchema,
});

/**
 * Experience memory extraction result
 */
export const ExperienceMemorySchema = z.object({
  memories: z.array(ExperienceMemoryItemSchema),
});

export type WithExperience = z.infer<typeof WithExperienceSchema>;
export type ExperienceMemoryItem = z.infer<typeof ExperienceMemoryItemSchema>;
export type ExperienceMemory = z.infer<typeof ExperienceMemorySchema>;
