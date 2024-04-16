/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { z } from 'zod';

export const DB_PluginSchema = z.object({
  identifier: z.string(),
  id: z.string(),
  type: z.enum(['plugin', 'customPlugin']),
  manifest: z.any().optional(),
  settings: z.any().optional(),
});

export type DB_Plugin = z.infer<typeof DB_PluginSchema>;
