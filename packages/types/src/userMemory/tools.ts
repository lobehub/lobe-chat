import { z } from 'zod';

import { UserMemoryContext, UserMemoryExperience, UserMemoryPreference } from './layers';
import {
  IdentityTypeEnum,
  LayersEnum,
  MergeStrategyEnum,
  RelationshipEnum,
  TypesEnum,
} from './shared';

export const addMemoryBaseSchema = z.object({
  details: z.string().describe('Optional detailed information'),
  memoryCategory: z
    .string()
    .describe(
      'Category of memory, describes the domain or context the memory belongs to, e.g. talking travel plan counts as `travel` category, all work related memories could be `work` category, except side projects, where we belongs to `project` category',
    ),
  // TODO: migrate to .enum() if we could move to
  // zod v4
  // Read more: https://zod.dev/api#enum
  memoryLayer: z
    .nativeEnum(LayersEnum)
    .describe(
      'Memory layer, must be one of `context`, `identity`, `preference`, `experience`, `activity`',
    ),
  memoryType: z
    .nativeEnum(TypesEnum)
    .describe(
      'Type of memory, used to describe the specific nature or classification of the memory related to',
    ),
  summary: z.string().describe('Concise overview of this specific memory'),
  title: z.string().describe('Brief descriptive title'),
});

export type AddMemoryBaseParams = z.infer<typeof addMemoryBaseSchema>;

export const addExperienceMemorySchema = addMemoryBaseSchema.extend({
  withExperience: z.object({
    action: z
      .string()
      .nullable()
      .describe('Narrative describing actions taken or behaviors exhibited'),
    keyLearning: z
      .string()
      .nullable()
      .describe('Narrative describing key insights or lessons learned'),
    possibleOutcome: z
      .string()
      .nullable()
      .describe('Narrative describing potential outcomes or learnings'),
    reasoning: z
      .string()
      .nullable()
      .describe('Narrative describing the thought process or motivations'),
    scoreConfidence: z
      .number()
      .nullable()
      .describe(
        'Numeric score (0-1 or domain-specific) describing confidence in the experience details',
      ),
    situation: z.string().nullable().describe('Narrative describing the situation or event'),
    tags: z.array(z.string()).describe('Model generated tags that summarize the experience facets'),
  }),
});

export type AddExperienceMemoryParams = z.infer<typeof addExperienceMemorySchema>;

export const addContextMemorySchema = addMemoryBaseSchema.extend({
  withContext: z.object({
    associatedObjects: z
      .array(z.object({}))
      .describe('describing involved roles, entities, or resources'),
    associatedSubjects: z
      .array(z.object({}))
      .describe('describing involved roles, entities, or resources'),
    currentStatus: z
      .string()
      .nullable()
      .describe("High level status markers (e.g., 'active', 'pending')"),
    description: z
      .string()
      .describe('Rich narrative describing the situation, timeline, or environment'),
    scoreImpact: z
      .number()
      .nullable()
      .describe('Numeric score (0-1 or domain-specific) describing importance'),
    scoreUrgency: z
      .number()
      .nullable()
      .describe('Numeric score (0-1 or domain-specific) describing urgency'),
    tags: z.array(z.string()).describe('Model generated tags that summarize the context themes'),
    title: z.string().nullable().describe('Optional synthesized context headline'),
    type: z
      .string()
      .nullable()
      .describe(
        "High level context archetype (e.g., 'temporarily', 'private', 'questioning', 'formal', 'assistant', 'mentorship')",
      ),
  }),
});

export type AddContextMemoryParams = z.infer<typeof addContextMemorySchema>;

export const addPreferenceMemorySchema = addMemoryBaseSchema.extend({
  withPreference: z.object({
    appContext: z
      .object({
        app: z.string().nullable().describe('App or product name this applies to'),
        feature: z.string().nullable(),
        route: z.string().nullable(),
        surface: z.string().nullable().describe('e.g., chat, emails, code review, notes'),
      })
      .strict()
      .describe('Application/surface specific preference, if any'),
    conclusionDirectives: z
      .string()
      .describe(
        "Direct, self-contained instruction to the assistant from the user's perspective (what to do, not how to implement)",
      ),
    extractedScopes: z
      .array(z.string())
      .describe('describing preference facets and applicable scopes'),
    originContext: z
      .object({
        actor: z.string().nullable().describe("Who stated the preference; use 'User' for the user"),
        applicableWhen: z.string().nullable().describe('Conditions where this preference applies'),
        notApplicableWhen: z.string().nullable().describe('Conditions where it does not apply'),
        scenario: z.string().nullable().describe('Applicable scenario or use case'),
        trigger: z.string().nullable().describe('What prompted this preference'),
      })
      .strict()
      .describe('Context of how/why this preference was expressed'),
    scorePriority: z
      .number()
      .nullable()
      .describe('Numeric prioritization weight where higher means more critical to respect'),
    suggestions: z
      .array(z.string())
      .describe('Follow-up actions or assistant guidance derived from the preference'),
    tags: z.array(z.string()).describe('Model generated tags that summarize the preference facets'),
    type: z
      .string()
      .nullable()
      .describe("High level preference classification (e.g., 'lifestyle', 'communication')"),
  }),
});

export type AddPreferenceMemoryParams = z.infer<typeof addPreferenceMemorySchema>;

export const addIdentityMemorySchema = addMemoryBaseSchema.extend({
  withIdentity: z.object({
    description: z
      .string()
      .describe(
        "Rich narrative describing the person's background, roles, and attributes (required)",
      ),
    episodicDate: z
      .string()
      .nullable()
      .describe(
        'Optional ISO 8601 timestamp describing when this identity aspect is most relevant',
      ),
    relationship: z
      .nativeEnum(RelationshipEnum)
      .describe(
        "Relationship of this identity to the user. Use 'self' when the identity is the user themselves",
      ),
    role: z
      .string()
      .nullable()
      .describe("Short role label (e.g., 'software engineer', 'student', 'manager', 'mentor')"),
    scoreConfidence: z
      .number()
      .nullable()
      .describe('Model confidence (0-1) that this identity aspect is correct'),
    sourceEvidence: z
      .string()
      .nullable()
      .describe('Optional short quote or pointer to evidence in the current conversation'),
    tags: z.array(z.string()).describe('Model generated tags that summarize the identity facets'),
    type: z.nativeEnum(IdentityTypeEnum).describe('High level identity archetype'),
  }),
});

export type AddIdentityMemoryParams = z.infer<typeof addIdentityMemorySchema>;

export const updateIdentityMemorySchema = z.object({
  id: z.string().describe('The ID of the identity entry to update'),
  mergeStrategy: z
    .nativeEnum(MergeStrategyEnum)
    .describe('replace: overwrite all fields; merge: update only provided fields'),
  set: z
    .object({
      description: z.string().optional(),
      episodicDate: z.string().nullable().optional(),
      relationship: z.nativeEnum(RelationshipEnum).optional(),
      role: z.string().nullable().optional(),
      scoreConfidence: z.number().nullable().optional(),
      sourceEvidence: z.string().nullable().optional(),
      tags: z.array(z.string()).optional(),
      type: z.string().nullable().optional(),
    })
    .strict()
    .describe('Fields to update'),
});

export type UpdateIdentityMemoryParams = z.infer<typeof updateIdentityMemorySchema>;

export const removeIdentityMemorySchema = z.object({
  id: z.string().describe('The ID of the identity entry to remove'),
  reason: z.string().describe('Brief reasoning: incorrect, obsolete, or duplicate'),
});

export type RemoveIdentityMemoryParams = z.infer<typeof removeIdentityMemorySchema>;

export const searchMemorySchema = z.object({
  // TODO: we need to dynamically fetch the available categories/types from the backend
  // memoryCategory: z.string().optional(),
  // memoryType: z.string().optional(),
  query: z.string(),
  topK: z.object({
    contexts: z.coerce.number().int().min(0),
    experiences: z.coerce.number().int().min(0),
    preferences: z.coerce.number().int().min(0),
  }),
});

export type SearchMemoryParams = z.infer<typeof searchMemorySchema>;

export interface SearchMemoryResult {
  contexts: Array<Omit<UserMemoryContext, 'userId' | 'descriptionVector'>>;
  experiences: Array<
    Omit<UserMemoryExperience, 'userId' | 'actionVector' | 'situationVector' | 'keyLearningVector'>
  >;
  preferences: Array<Omit<UserMemoryPreference, 'userId' | 'conclusionDirectivesVector'>>;
}

export type RetrieveMemoryParams = SearchMemoryParams;
export type RetrieveMemoryResult = SearchMemoryResult;
