import { PluginSchema } from '@lobehub/chat-plugin-sdk';
import { any, number, object, string } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { BuiltinToolManifest } from '@/types/tool';

import { systemPrompt } from './systemRole';
import { MemoryApiName } from './types';

export const MemoryManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'Save important information to memory for future reference. Use this to remember user preferences, important facts, or ongoing conversations.',
      name: MemoryApiName.saveMemory,
      parameters: zodToJsonSchema(
        object({
          details: string().optional().describe('Optional detailed information'),
          memoryCategory: string()
            .optional()
            .describe('Category for organization (e.g., "personal", "work", "project")'),
          memoryType: string()
            .optional()
            .describe('Type of memory (e.g., "preference", "fact", "context")'),
          summary: string().describe('A concise summary of the information to remember'),
          title: string().describe('A brief title for this memory'),
        }),
      ) as PluginSchema,
    },
    {
      description:
        'Retrieve memories based on a search query. Use this to recall previously saved information.',
      name: MemoryApiName.retrieveMemory,
      parameters: zodToJsonSchema(
        object({
          limit: string().optional().describe('Maximum number of memories to return (default: 5)'),
          memoryCategory: string().optional().describe('Filter by memory category'),
          memoryType: string().optional().describe('Filter by memory type'),
          query: string().describe('Search query to find relevant memories'),
        }),
      ) as PluginSchema,
    },
    {
      description:
        'Group related memory entries into a rich situational context with shared labels, participants, and status.',
      name: MemoryApiName.categorizeContext,
      parameters: zodToJsonSchema(
        object({
          associatedObjects: any()
            .optional()
            .describe('JSON description of objects, resources, or artifacts tied to the context.'),
          associatedSubjects: any()
            .optional()
            .describe('JSON description of people or roles involved in the context.'),
          contextId: string()
            .optional()
            .describe('Existing context ID to update. Omit to create a new context record.'),
          currentStatus: string()
            .optional()
            .describe('Lifecycle status for the context (e.g., active, completed, paused).'),
          description: string()
            .optional()
            .describe('Detailed description of the context storyline.'),
          extractedLabels: any()
            .optional()
            .describe('Model extracted labels or taxonomy nodes associated with the context.'),
          scoreImpact: number()
            .optional()
            .describe('Relative importance score for how much this context impacts the user.'),
          scoreUrgency: number()
            .optional()
            .describe('Relative urgency score indicating how time-sensitive this context is.'),
          title: string().optional().describe('Optional headline summarizing the context.'),
          type: string()
            .optional()
            .describe(
              'High level context classification such as project, relationship, health, etc.',
            ),
        }),
      ) as PluginSchema,
    },
    {
      description:
        'Record explicit user preferences or directives extracted from memories or contexts for future decision-making.',
      name: MemoryApiName.categorizePreference,
      parameters: zodToJsonSchema(
        object({
          conclusionDirectives: string()
            .optional()
            .describe(
              'Self-contained directive summarizing the preference for assistant behavior.',
            ),
          extractedLabels: any()
            .optional()
            .describe('Model extracted preference labels or traits.'),
          extractedScopes: any()
            .optional()
            .describe(
              'JSON structure describing the scope or situations where the preference applies.',
            ),
          scorePriority: number()
            .optional()
            .describe(
              'Numeric priority score reflecting how critical it is to honor this preference.',
            ),
          suggestions: string()
            .optional()
            .describe(
              'Optional assistant suggestions or follow-up actions derived from this preference.',
            ),
          type: string()
            .optional()
            .describe(
              'High level preference classification such as lifestyle, communication, or productivity.',
            ),
        }),
      ) as PluginSchema,
    },
  ],
  identifier: 'lobe-memory',
  meta: {
    avatar: '🧠',
    title: 'Memory',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};

export type {
  RetrieveMemoryParams,
  RetrieveMemoryResult,
  SaveMemoryParams,
  SaveMemoryResult,
} from './types';
export { MemoryApiName } from './types';
