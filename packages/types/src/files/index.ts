import { z } from 'zod';

export enum FilesTabs {
  All = 'all',
  Audios = 'audios',
  Documents = 'documents',
  Images = 'images',
  Videos = 'videos',
  Websites = 'websites',
}

export enum FileSource {
  ImageGeneration = 'image_generation',
}

export interface FileItem {
  createdAt: Date;
  enabled?: boolean;
  id: string;
  name: string;
  size: number;
  source?: FileSource | null;
  type: string;
  updatedAt: Date;
  url: string;
}
const BatchDownloadEventSchema = z.union([
  z.object({ data: z.string(), size: z.number(), type: z.literal('chunk') }),
  z.object({ message: z.string(), percent: z.number(), type: z.literal('progress') }),
  z.object({ message: z.string(), type: z.literal('warning') }),
  z.object({
    downloadedCount: z.number(),
    fileName: z.string(),
    totalCount: z.number(),
    type: z.literal('done'),
  }),
  z.object({ message: z.string(), type: z.literal('error') }),
]);

export type BatchDownloadEventType = z.infer<typeof BatchDownloadEventSchema>;

export * from './list';
export * from './upload';
