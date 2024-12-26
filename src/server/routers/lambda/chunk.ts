import { inArray } from 'drizzle-orm/expressions';
import { z } from 'zod';

import { DEFAULT_EMBEDDING_MODEL } from '@/const/settings';
import { knowledgeBaseFiles } from '@/database/schemas';
import { serverDB } from '@/database/server';
import { AsyncTaskModel } from '@/database/server/models/asyncTask';
import { ChunkModel } from '@/database/server/models/chunk';
import { EmbeddingModel } from '@/database/server/models/embedding';
import { FileModel } from '@/database/server/models/file';
import { MessageModel } from '@/database/server/models/message';
import { ModelProvider } from '@/libs/agent-runtime';
import { authedProcedure, router } from '@/libs/trpc';
import { keyVaults } from '@/libs/trpc/middleware/keyVaults';
import { initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import { ChunkService } from '@/server/services/chunk';
import { SemanticSearchSchema } from '@/types/rag';

const chunkProcedure = authedProcedure.use(keyVaults).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      asyncTaskModel: new AsyncTaskModel(serverDB, ctx.userId),
      chunkModel: new ChunkModel(serverDB, ctx.userId),
      chunkService: new ChunkService(ctx.userId),
      embeddingModel: new EmbeddingModel(serverDB, ctx.userId),
      fileModel: new FileModel(serverDB, ctx.userId),
      messageModel: new MessageModel(serverDB, ctx.userId),
    },
  });
});

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
        model: z.string().default(DEFAULT_EMBEDDING_MODEL),
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.time('embedding');
      const agentRuntime = await initAgentRuntimeWithUserPayload(
        ModelProvider.OpenAI,
        ctx.jwtPayload,
      );

      const embeddings = await agentRuntime.embeddings({
        dimensions: 1024,
        input: input.query,
        model: input.model,
      });
      console.timeEnd('embedding');

      return ctx.chunkModel.semanticSearch({
        embedding: embeddings![0],
        fileIds: input.fileIds,
        query: input.query,
      });
    }),

  semanticSearchForChat: chunkProcedure
    .input(SemanticSearchSchema)
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.messageModel.findMessageQueriesById(input.messageId);
      let embedding: number[];
      let ragQueryId: string;

      // if there is no message rag or it's embeddings, then we need to create one
      if (!item || !item.embeddings) {
        // TODO: need to support customize
        const agentRuntime = await initAgentRuntimeWithUserPayload(
          ModelProvider.OpenAI,
          ctx.jwtPayload,
        );

        const embeddings = await agentRuntime.embeddings({
          dimensions: 1024,
          input: input.rewriteQuery,
          model: input.model || DEFAULT_EMBEDDING_MODEL,
        });

        embedding = embeddings![0];
        const embeddingsId = await ctx.embeddingModel.create({
          embeddings: embedding,
          model: input.model,
        });

        const result = await ctx.messageModel.createMessageQuery({
          embeddingsId,
          messageId: input.messageId,
          rewriteQuery: input.rewriteQuery,
          userQuery: input.userQuery,
        });

        ragQueryId = result.id;
      } else {
        embedding = item.embeddings;
        ragQueryId = item.id;
      }

      console.time('semanticSearch');
      let finalFileIds = input.fileIds ?? [];

      if (input.knowledgeIds && input.knowledgeIds.length > 0) {
        const knowledgeFiles = await serverDB.query.knowledgeBaseFiles.findMany({
          where: inArray(knowledgeBaseFiles.knowledgeBaseId, input.knowledgeIds),
        });

        finalFileIds = knowledgeFiles.map((f) => f.fileId).concat(finalFileIds);
      }

      const chunks = await ctx.chunkModel.semanticSearchForChat({
        embedding,
        fileIds: finalFileIds,
        query: input.rewriteQuery,
      });
      console.timeEnd('semanticSearch');

      return { chunks, queryId: ragQueryId };
    }),
});
