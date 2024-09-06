import { z } from 'zod';

export const DB_SessionGroupSchema = z.object({
  name: z.string(),
  sort: z.number().optional(),
});

export type DB_SessionGroup = z.infer<typeof DB_SessionGroupSchema>;
