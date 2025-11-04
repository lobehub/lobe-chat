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
