import { z } from 'zod';

import { MemoryTypeEnum } from './common';

/**
 * Preference origin context
 */
export const OriginContextSchema = z.object({
  actor: z
    .string()
    .nullable()
    .optional()
    .describe("Who stated the preference; use 'User' for the user"),
  applicableWhen: z
    .string()
    .nullable()
    .optional()
    .describe('Conditions where this preference applies'),
  notApplicableWhen: z
    .string()
    .nullable()
    .optional()
    .describe('Conditions where it does not apply'),
  scenario: z.string().nullable().optional().describe('Applicable scenario or use case'),
  trigger: z.string().nullable().optional().describe('What prompted this preference'),
});

/**
 * Application context for preferences
 */
export const AppContextSchema = z.object({
  app: z.string().nullable().optional().describe('App or product name this applies to'),
  feature: z.string().nullable().optional(),
  route: z.string().nullable().optional(),
  surface: z.string().nullable().optional().describe('e.g., chat, emails, code review, notes'),
});

/**
 * Preference-specific fields
 */
export const WithPreferenceSchema = z.object({
  appContext: AppContextSchema.optional().describe(
    'Application/surface specific preference, if any',
  ),
  conclusionDirectives: z
    .string()
    .optional()
    .describe(
      "Direct, self-contained instruction to the assistant from the user's perspective (what to do, not how to implement)",
    ),
  extractedLabels: z
    .array(z.string())
    .optional()
    .describe('Model generated tags that summarize the preference facets'),
  extractedScopes: z
    .array(z.string())
    .optional()
    .describe('Array of JSON strings describing preference facets and applicable scopes'),
  originContext: OriginContextSchema.optional().describe(
    'Context of how/why this preference was expressed',
  ),
  scorePriority: z
    .number()
    .nullable()
    .optional()
    .describe('Numeric prioritization weight where higher means more critical to respect'),
  suggestions: z
    .array(z.string())
    .optional()
    .describe('Follow-up actions or assistant guidance derived from the preference'),
  type: z
    .string()
    .nullable()
    .optional()
    .describe("High level preference classification (e.g., 'lifestyle', 'communication')"),
});

/**
 * Single preference memory item
 */
export const PreferenceMemoryItemSchema = z.object({
  details: z.string().optional().describe('Optional detailed information'),
  memoryCategory: z.string().describe('Memory category'),
  memoryLayer: z.literal('preference').describe('Memory layer'),
  memoryType: MemoryTypeEnum.describe('Memory type'),
  summary: z.string().describe('Concise overview of this specific memory'),
  title: z.string().describe('Brief descriptive title'),
  withPreference: WithPreferenceSchema,
});

/**
 * Preference memory extraction result
 */
export const PreferenceMemorySchema = z.object({
  memories: z.array(PreferenceMemoryItemSchema),
});

export type OriginContext = z.infer<typeof OriginContextSchema>;
export type AppContext = z.infer<typeof AppContextSchema>;
export type WithPreference = z.infer<typeof WithPreferenceSchema>;
export type PreferenceMemoryItem = z.infer<typeof PreferenceMemoryItemSchema>;
export type PreferenceMemory = z.infer<typeof PreferenceMemorySchema>;
