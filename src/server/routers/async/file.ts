import { TRPCError } from '@trpc/server';
import { chunk } from 'lodash-es';
import pMap from 'p-map';
import { z } from 'zod';

import { initAgentRuntimeWithUserPayload } from '@/app/api/chat/agentRuntime';
import { fileEnv } from '@/config/file';
import { DEFAULT_EMBEDDING_MODEL } from '@/const/settings';
import { ASYNC_TASK_TIMEOUT, AsyncTaskModel } from '@/database/server/models/asyncTask';
import { ChunkModel } from '@/database/server/models/chunk';
import { EmbeddingModel } from '@/database/server/models/embedding';
import { FileModel } from '@/database/server/models/file';
import { NewChunkItem, NewEmbeddingsItem } from '@/database/server/schemas/lobechat';
import { ModelProvider } from '@/libs/agent-runtime';
import { asyncAuthedProcedure, asyncRouter as router } from '@/libs/trpc/async';
import { S3 } from '@/server/modules/S3';
import { ChunkService } from '@/server/services/chunk';
import {
  AsyncTaskError,
  AsyncTaskErrorType,
  AsyncTaskStatus,
  IAsyncTaskError,
} from '@/types/asyncTask';
import { safeParseJSON } from '@/utils/safeParseJSON';

const fileProcedure = asyncAuthedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      asyncTaskModel: new AsyncTaskModel(ctx.userId),
      chunkModel: new ChunkModel(ctx.userId),
      chunkService: new ChunkService(ctx.userId),
      embeddingModel: new EmbeddingModel(ctx.userId),
      fileModel: new FileModel(ctx.userId),
    },
  });
});

export const fileRouter = router({
  embeddingChunks: fileProcedure
    .input(
      z.object({
        fileId: z.string(),
        model: z.string().default(DEFAULT_EMBEDDING_MODEL),
        taskId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.fileModel.findById(input.fileId);

      if (!file) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' });
      }

      const asyncTask = await ctx.asyncTaskModel.findById(input.taskId);

      if (!asyncTask) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Async Task not found' });

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new AsyncTaskError(
                AsyncTaskErrorType.Timeout,
                'embedding task is timeout, please try again',
              ),
            );
          }, ASYNC_TASK_TIMEOUT);
        });

        const embeddingPromise = async () => {
          // update the task status to success
          await ctx.asyncTaskModel.update(input.taskId, {
            status: AsyncTaskStatus.Processing,
          });

          const startAt = Date.now();

          const CHUNK_SIZE = 50;
          const CONCURRENCY = 10;

          const chunks = await ctx.chunkModel.getChunksTextByFileId(input.fileId);
          const requestArray = chunk(chunks, CHUNK_SIZE);

          try {
            await pMap(
              requestArray,
              async (chunks, index) => {
                const agentRuntime = await initAgentRuntimeWithUserPayload(
                  ModelProvider.OpenAI,
                  ctx.jwtPayload,
                );

                const number = index + 1;
                console.log(`执行第 ${number} 个任务`);

                console.time(`任务[${number}]: embeddings`);

                const embeddings = await agentRuntime.embeddings({
                  dimensions: 1024,
                  input: chunks.map((c) => c.text),
                  model: input.model,
                });
                console.timeEnd(`任务[${number}]: embeddings`);

                const items: NewEmbeddingsItem[] =
                  embeddings?.map((e) => ({
                    chunkId: chunks[e.index].id,
                    embeddings: e.embedding,
                    fileId: input.fileId,
                    model: input.model,
                  })) || [];

                console.time(`任务[${number}]: insert db`);
                await ctx.embeddingModel.bulkCreate(items);
                console.timeEnd(`任务[${number}]: insert db`);
              },
              { concurrency: CONCURRENCY },
            );
          } catch (e) {
            throw {
              message: JSON.stringify(e),
              name: AsyncTaskErrorType.EmbeddingError,
            };
          }

          const duration = Date.now() - startAt;
          // update the task status to success
          await ctx.asyncTaskModel.update(input.taskId, {
            duration,
            status: AsyncTaskStatus.Success,
          });

          return { success: true };
        };

        // Race between the chunking process and the timeout
        return await Promise.race([embeddingPromise(), timeoutPromise]);
      } catch (e) {
        console.error('embeddingChunks error', e);

        await ctx.asyncTaskModel.update(input.taskId, {
          error: new AsyncTaskError((e as Error).name, (e as Error).message),
          status: AsyncTaskStatus.Error,
        });

        return {
          message: `File ${file.name}(${input.taskId}) failed to embedding: ${(e as Error).message}`,
          success: false,
        };
      }
    }),

  parseFileToChunks: fileProcedure
    .input(
      z.object({
        fileId: z.string(),
        taskId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.fileModel.findById(input.fileId);
      if (!file) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' });
      }

      const s3 = new S3();

      let content: Uint8Array | undefined;
      try {
        content = await s3.getFileByteArray(file.url);
      } catch (e) {
        console.error(e);
        // if file not found, delete it from db
        if ((e as any).Code === 'NoSuchKey') {
          await ctx.fileModel.delete(input.fileId);
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' });
        }
      }

      if (!content) return;

      const asyncTask = await ctx.asyncTaskModel.findById(input.taskId);

      if (!asyncTask) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Async Task not found' });

      try {
        const startAt = Date.now();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new AsyncTaskError(
                AsyncTaskErrorType.Timeout,
                'chunking task is timeout, please try again',
              ),
            );
          }, ASYNC_TASK_TIMEOUT);
        });

        const chunkingPromise = async () => {
          const chunkService = ctx.chunkService;
          // update the task status to processing
          await ctx.asyncTaskModel.update(input.taskId, { status: AsyncTaskStatus.Processing });

          // partition file to chunks
          const chunkResult = await chunkService.chunkContent({
            content,
            fileType: file.fileType,
            filename: file.name,
          });

          // after finish partition, we need to filter out some elements
          const chunks = chunkResult.chunks.map(
            (item): NewChunkItem => ({ ...item, userId: ctx.userId }),
          );

          const duration = Date.now() - startAt;

          // if no chunk found, throw error
          if (chunks.length === 0) {
            throw {
              message:
                'No chunk found in this file. it may due to current chunking method can not parse file accurately',
              name: AsyncTaskErrorType.NoChunkError,
            };
          }

          await ctx.chunkModel.bulkCreate(chunks, input.fileId);

          if (chunkResult.unstructuredChunks) {
            const unstructuredChunks = chunkResult.unstructuredChunks.map(
              (item): NewChunkItem => ({ ...item, fileId: input.fileId, userId: ctx.userId }),
            );
            await ctx.chunkModel.bulkCreateUnstructuredChunks(unstructuredChunks);
          }

          // update the task status to success
          await ctx.asyncTaskModel.update(input.taskId, {
            duration,
            status: AsyncTaskStatus.Success,
          });

          // if enable auto embedding, trigger the embedding task
          if (fileEnv.CHUNKS_AUTO_EMBEDDING) {
            await chunkService.asyncEmbeddingFileChunks(input.fileId, ctx.jwtPayload);
          }

          return { success: true };
        };
        // Race between the chunking process and the timeout
        return await Promise.race([chunkingPromise(), timeoutPromise]);
      } catch (e) {
        const error = e as any;

        const asyncTaskError = error.body
          ? ({ body: safeParseJSON(error.body) ?? error.body, name: error.name } as IAsyncTaskError)
          : new AsyncTaskError((error as Error).name, error.message);

        console.error('[Chunking Error]', asyncTaskError);
        await ctx.asyncTaskModel.update(input.taskId, {
          error: asyncTaskError,
          status: AsyncTaskStatus.Error,
        });

        return {
          message: `File ${file.name}(${input.taskId}) failed to chunking: ${(e as Error).message}`,
          success: false,
        };
      }
    }),
});
