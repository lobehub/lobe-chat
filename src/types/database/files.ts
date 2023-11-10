import { z } from 'zod';

export const LocalFileSchema = z.object({
  createdAt: z.number(),
  data: z.instanceof(ArrayBuffer),
  name: z.string(),
  size: z.number(),
  type: z.string(),
});

export type LocalFile = z.infer<typeof LocalFileSchema>;
