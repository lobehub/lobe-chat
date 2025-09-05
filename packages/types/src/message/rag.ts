import { z } from 'zod';

import { MessageSemanticSearchChunk } from '../rag';

export const SemanticSearchChunkSchema = z.object({
  id: z.string(),
  similarity: z.number(),
});

export interface UpdateMessageRAGParams {
  fileChunks: MessageSemanticSearchChunk[];
  ragQueryId?: string;
}

export const UpdateMessageRAGParamsSchema = z.object({
  id: z.string(),
  value: z.object({
    fileChunks: z.array(SemanticSearchChunkSchema),
    ragQueryId: z.string().optional(),
  }),
});
