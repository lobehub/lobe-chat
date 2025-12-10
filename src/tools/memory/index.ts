import {
  AddIdentityActionSchema,
  ContextMemoryItemSchema,
  ExperienceMemoryItemSchema,
  PreferenceMemoryItemSchema,
  RemoveIdentityActionSchema,
  UpdateIdentityActionSchema,
} from '@lobechat/memory-user-memory/schemas';
import { PluginSchema } from '@lobehub/chat-plugin-sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { BuiltinToolManifest } from '@/types/tool';
import { searchMemorySchema } from '@/types/userMemory';

import { systemPrompt } from './systemRole';
import { MemoryApiName as InternalMemoryApiName } from './types';

export const MemoryManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'Retrieve memories based on a search query. Use this to recall previously saved information.',
      name: InternalMemoryApiName.searchUserMemory,
      parameters: zodToJsonSchema(searchMemorySchema) as PluginSchema,
    },
    {
      description:
        'Create a context memory that captures ongoing situations, projects, or environments. Include actors, resources, statuses, urgency/impact, and a clear description.',
      name: InternalMemoryApiName.addContextMemory,
      parameters: zodToJsonSchema(ContextMemoryItemSchema) as PluginSchema,
    },
    {
      description:
        'Record an experience memory capturing situation, actions, reasoning, outcomes, and confidence. Use for lessons, playbooks, or transferable know-how.',
      name: InternalMemoryApiName.addExperienceMemory,
      parameters: zodToJsonSchema(ExperienceMemoryItemSchema) as PluginSchema,
    },
    {
      description:
        'Add an identity memory describing enduring facts about a person, their role, relationship, and supporting evidence. Use to track self/others identities.',
      name: InternalMemoryApiName.addIdentityMemory,
      parameters: zodToJsonSchema(AddIdentityActionSchema) as PluginSchema,
    },
    {
      description:
        'Create a preference memory that encodes durable directives or choices the assistant should follow. Include conclusionDirectives, scopes, and context.',
      name: InternalMemoryApiName.addPreferenceMemory,
      parameters: zodToJsonSchema(PreferenceMemoryItemSchema) as PluginSchema,
    },
    {
      description:
        'Update an existing identity memory with refined details, relationships, roles, or tags. Use mergeStrategy to control replacement vs merge.',
      name: InternalMemoryApiName.updateIdentityMemory,
      parameters: zodToJsonSchema(UpdateIdentityActionSchema) as PluginSchema,
    },
    {
      description:
        'Remove an identity memory when it is incorrect, obsolete, or duplicated. Always provide a concise reason.',
      name: InternalMemoryApiName.removeIdentityMemory,
      parameters: zodToJsonSchema(RemoveIdentityActionSchema) as PluginSchema,
    },
  ],
  identifier: 'lobe-user-memory',
  meta: {
    avatar: '🧠',
    title: 'Memory',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};

export const UserMemoryManifest = MemoryManifest;

export type { RetrieveMemoryParams } from './types';
export { MemoryApiName } from './types';
