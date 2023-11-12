import { z } from 'zod';

export const LocalFileSchema = z.object({
  createdAt: z.number(),
  data: z.instanceof(ArrayBuffer),
  fileType: z.string(),
  name: z.string(),
  saveMode: z.enum(['local', 'url']),
  size: z.number(),
  url: z.string().url().optional(),
});

export type LocalFile = z.infer<typeof LocalFileSchema>;
