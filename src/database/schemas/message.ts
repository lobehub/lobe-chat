/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { z } from 'zod';

export const DB_MessageSchema = z.object({
  role: z.enum(['user', 'tool', 'system', 'assistant', 'function']),
  content: z.string(),
  files: z.array(z.string()).optional(),
  favorite: z.boolean().optional(),
  extra: z.string().optional(),
  error: z.any().optional(),

  plugin: z
    .object({
      identifier: z.string(),
      argument: z.string(),
      apiName: z.string(),
    })
    .optional(),
  pluginState: z.any().optional(),

  // foreign keys
  parentId: z.string().optional(),
  quotaId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type DB_Message = z.infer<typeof DB_MessageSchema>;
