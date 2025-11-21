import { DEFAULT_FILE_EMBEDDING_MODEL_ITEM } from '@lobechat/const';
import { ChatSemanticSearchChunk, FileSearchResult, SemanticSearchSchema } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import { inArray } from 'drizzle-orm';
import { z } from 'zod';

import { AsyncTaskModel } from '@/database/models/asyncTask';
import { ChunkModel } from '@/database/models/chunk';
import { EmbeddingModel } from '@/database/models/embedding';
import { FileModel } from '@/database/models/file';
import { MessageModel } from '@/database/models/message';
import { knowledgeBaseFiles } from '@/database/schemas';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { keyVaults, serverDatabase } from '@/libs/trpc/lambda/middleware';
import { getServerDefaultFilesConfig } from '@/server/globalConfig';
import { initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';
import { ChunkService } from '@/server/services/chunk';

const chunkProcedure = authedProcedure
  .use(serverDatabase)
  .use(keyVaults)
  .use(async (opts) => {
    const { ctx } = opts;

    return opts.next({
      ctx: {
        asyncTaskModel: new AsyncTaskModel(ctx.serverDB, ctx.userId),
        chunkModel: new ChunkModel(ctx.serverDB, ctx.userId),
        chunkService: new ChunkService(ctx.serverDB, ctx.userId),
        embeddingModel: new EmbeddingModel(ctx.serverDB, ctx.userId),
        fileModel: new FileModel(ctx.serverDB, ctx.userId),
        messageModel: new MessageModel(ctx.serverDB, ctx.userId),
      },
    });
  });

/**
 * Group chunks by file and calculate relevance scores
 */
const groupAndRankFiles = (chunks: ChatSemanticSearchChunk[], topK: number): FileSearchResult[] => {
  const fileMap = new Map<string, FileSearchResult>();

  // Group chunks by file
  for (const chunk of chunks) {
    const fileId = chunk.fileId || 'unknown';
    const fileName = chunk.fileName || `File ${fileId}`;

    if (!fileMap.has(fileId)) {
      fileMap.set(fileId, {
        fileId,
        fileName,
        relevanceScore: 0,
        topChunks: [],
      });
    }

    const fileResult = fileMap.get(fileId)!;
    fileResult.topChunks.push({
      id: chunk.id,
      similarity: chunk.similarity,
      text: chunk.text || '',
    });
  }

  // Calculate relevance score for each file (average of top 3 chunks)
  for (const fileResult of fileMap.values()) {
    fileResult.topChunks.sort((a, b) => b.similarity - a.similarity);
    const top3 = fileResult.topChunks.slice(0, 3);
    fileResult.relevanceScore = top3.reduce((sum, chunk) => sum + chunk.similarity, 0) / top3.length;
    // Keep only top chunks per file
    fileResult.topChunks = fileResult.topChunks.slice(0, 3);
  }

  // Sort files by relevance score and return top K
  return Array.from(fileMap.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);
};

export const chunkRouter = router({
  createEmbeddingChunksTask: chunkProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asyncTaskId = await ctx.chunkService.asyncEmbeddingFileChunks(input.id, ctx.jwtPayload);

      return { id: asyncTaskId, success: true };
    }),

  createParseFileTask: chunkProcedure
    .input(
      z.object({
        id: z.string(),
        skipExist: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asyncTaskId = await ctx.chunkService.asyncParseFileToChunks(
        input.id,
        ctx.jwtPayload,
        input.skipExist,
      );

      return { id: asyncTaskId, success: true };
    }),

  getChunksByFileId: chunkProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return {
        items: await ctx.chunkModel.findByFileId(input.id, input.cursor || 0),
        nextCursor: input.cursor ? input.cursor + 1 : 1,
      };
    }),

  retryParseFileTask: chunkProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.fileModel.findById(input.id);

      if (!result) return;

      // 1. delete the previous task if exist
      if (result.chunkTaskId) {
        await ctx.asyncTaskModel.delete(result.chunkTaskId);
      }

      // 2. create a new asyncTask for chunking
      const asyncTaskId = await ctx.chunkService.asyncParseFileToChunks(input.id, ctx.jwtPayload);

      return { id: asyncTaskId, success: true };
    }),

  semanticSearch: chunkProcedure
    .input(
      z.object({
        fileIds: z.array(z.string()).optional(),
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { model, provider } =
        getServerDefaultFilesConfig().embeddingModel || DEFAULT_FILE_EMBEDDING_MODEL_ITEM;
      const agentRuntime = await initModelRuntimeWithUserPayload(provider, ctx.jwtPayload);

      const embeddings = await agentRuntime.embeddings({
        dimensions: 1024,
        input: input.query,
        model,
      });

      return ctx.chunkModel.semanticSearch({
        embedding: embeddings![0],
        fileIds: input.fileIds,
        query: input.query,
      });
    }),

  semanticSearchForChat: chunkProcedure
    .input(SemanticSearchSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { model, provider } =
          getServerDefaultFilesConfig().embeddingModel || DEFAULT_FILE_EMBEDDING_MODEL_ITEM;
        let embedding: number[];

        const agentRuntime = await initModelRuntimeWithUserPayload(provider, ctx.jwtPayload);

        // slice content to make sure in the context window limit
        const query = input.query.length > 8000 ? input.query.slice(0, 8000) : input.query;

        const embeddings = await agentRuntime.embeddings({
          dimensions: 1024,
          input: query,
          model,
        });

        embedding = embeddings![0];

        let finalFileIds = input.fileIds ?? [];

        if (input.knowledgeIds && input.knowledgeIds.length > 0) {
          const knowledgeFiles = await ctx.serverDB.query.knowledgeBaseFiles.findMany({
            where: inArray(knowledgeBaseFiles.knowledgeBaseId, input.knowledgeIds),
          });

          finalFileIds = knowledgeFiles.map((f) => f.fileId).concat(finalFileIds);
        }

        const chunks = await ctx.chunkModel.semanticSearchForChat({
          embedding,
          fileIds: finalFileIds,
          query: input.query,
          topK: input.topK,
        });

        // Group chunks by file and calculate relevance scores
        const fileResults = groupAndRankFiles(chunks, input.topK || 15);

        // TODO: need to rerank the chunks

        return { chunks, fileResults };
      } catch (e) {
        console.error(e);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: (e as any).errorType || JSON.stringify(e),
        });
      }
    }),
});
