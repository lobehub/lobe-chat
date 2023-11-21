/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { z } from 'zod';

import { LobeMetaDataSchema } from '@/types/meta';

export const DB_SessionSchema = z.object({
  type: z.enum(['agent', 'group']).default('agent'),
  pinned: z.boolean().default(false),
  config: z.object({}),
  meta: LobeMetaDataSchema,

  // foreign key
  messages: z.array(z.string()),
  files: z.array(z.string()),
  topics: z.array(z.string()),
});
/* eslint-enable  */

export type DB_Session = z.infer<typeof DB_SessionSchema>;
