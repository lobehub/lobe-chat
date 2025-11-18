import { z } from 'zod';

export interface ChatImageItem {
  alt: string;
  id: string;
  url: string;
}

export const ChatImageItemSchema = z.object({
  alt: z.string(),
  id: z.string(),
  url: z.string(),
});

export interface ChatImageChunk {
  data: string;
  id: string;
  isBase64?: boolean;
}
