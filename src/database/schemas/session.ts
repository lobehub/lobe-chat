import { z } from 'zod';

import { LobeMetaDataSchema } from '@/types/meta';

export const DB_SessionSchema = z.object({
  // TODO: Need to find a way to allow config outside the schema
  config: z.any(),
  group: z.string().default('default'),
  meta: LobeMetaDataSchema,
  type: z.enum(['agent', 'group']).default('agent'),
});

export type DB_Session = z.infer<typeof DB_SessionSchema>;
