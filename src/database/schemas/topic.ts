/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { z } from 'zod';

export const DB_TopicSchema = z.object({
  title: z.string(),
  favorite: z.number().int().default(0),

  // foreign keys
  sessionId: z.string().optional(),
});

export type DB_Topic = z.infer<typeof DB_TopicSchema>;
