import { z } from 'zod';

import { MemoryTypeSchema } from './common';
import { LayersEnum } from '@/types/userMemory';

/**
 * Experience-specific fields
 */
export const WithExperienceSchema = z.object({
  action: z
    .string()
    .describe('Narrative describing actions taken or behaviors exhibited'),
  keyLearning: z
    .string()
    .describe('Narrative describing key insights or lessons learned'),
  labels: z
    .array(z.string())
    .describe('Model generated tags that summarize the experience facets'),
  possibleOutcome: z
    .string()
    .describe('Narrative describing potential outcomes or learnings'),
  reasoning: z
    .string()
    .describe('Narrative describing the thought process or motivations'),
  scoreConfidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'Numeric score (0-1 (0% to 100%)) describing confidence in the experience details',
    ),
  situation: z.string().describe('Narrative describing the situation or event'),
  type: z.string().describe('Type of experience being recorded'),
});

/**
 * Single experience memory item
 */
export const ExperienceMemoryItemSchema = z.object({
  details: z.string().describe('Optional detailed information'),
  memoryCategory: z.string().describe('Memory category'),
  memoryLayer: z.literal(LayersEnum.Experience).describe('Memory layer'),
  memoryType: MemoryTypeSchema.describe('Memory type'),
  summary: z.string().describe('Concise overview of this specific memory'),
  tags: z.array(z.string()).describe('Model generated tags that summarize the experience facets'),
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
