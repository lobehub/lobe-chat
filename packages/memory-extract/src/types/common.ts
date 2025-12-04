import { z } from 'zod';

/**
 * Memory category values
 */
export const MEMORY_CATEGORIES = [
  'work',
  'personal',
  'health',
  'finance',
  'education',
  'entertainment',
  'travel',
  'relationships',
  'hobbies',
  'goals',
] as const;

/**
 * Memory type values
 */
export const MEMORY_TYPES = [
  'preference',
  'fact',
  'context',
  'activity',
  'event',
  'location',
  'people',
  'topic',
  'technology',
  'other',
] as const;

/**
 * Memory type enum
 */
export const MemoryTypeEnum = z.enum([
  'preference',
  'fact',
  'context',
  'activity',
  'event',
  'location',
  'people',
  'topic',
  'technology',
  'other',
]);

export type MemoryType = z.infer<typeof MemoryTypeEnum>;
