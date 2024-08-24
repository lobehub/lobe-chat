import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { AsyncTaskModel } from '@/database/server/models/asyncTask';
import { ChunkModel } from '@/database/server/models/chunk';
import { FileModel } from '@/database/server/models/file';
import { authedProcedure, router } from '@/libs/trpc';
import { S3 } from '@/server/modules/S3';
import { getFullFileUrl } from '@/server/utils/files';
import { AsyncTaskStatus, AsyncTaskType } from '@/types/asyncTask';
import { FileListItem, QueryFileListSchema, UploadFileSchema } from '@/types/files';

const fileProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      asyncTaskModel: new AsyncTaskModel(ctx.userId),
      chunkModel: new ChunkModel(ctx.userId),
      fileModel: new FileModel(ctx.userId),
    },
  });
});

export const fileRouter = router({
  checkFileHash: fileProcedure
    .input(z.object({ hash: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.fileModel.checkHash(input.hash);
    }),

  createFile: fileProcedure
    .input(
      UploadFileSchema.omit({ data: true, saveMode: true, url: true }).extend({ url: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { isExist } = await ctx.fileModel.checkHash(input.hash!);

      // if the file is not exist in global file, create a new one
      if (!isExist) {
        await ctx.fileModel.createGlobalFile({
          fileType: input.fileType,
          hashId: input.hash!,
          metadata: input.metadata,
          size: input.size,
          url: input.url,
        });
      }

      const { id } = await ctx.fileModel.create({
        fileHash: input.hash,
        fileType: input.fileType,
        knowledgeBaseId: input.knowledgeBaseId,
        metadata: input.metadata,
        name: input.name,
        size: input.size,
        url: input.url,
      });

      return { id, url: getFullFileUrl(input.url) };
    }),
  findById: fileProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const item = await ctx.fileModel.findById(input.id);
      if (!item) throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' });

      return { ...item, url: getFullFileUrl(item?.url) };
    }),

  getFileItemById: fileProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<FileListItem | undefined> => {
      const item = await ctx.fileModel.findById(input.id);

      if (!item) throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' });

      let embeddingTask = null;
      if (item.embeddingTaskId) {
        embeddingTask = await ctx.asyncTaskModel.findById(item.embeddingTaskId);
      }
      let chunkingTask = null;
      if (item.chunkTaskId) {
        chunkingTask = await ctx.asyncTaskModel.findById(item.chunkTaskId);
      }

      const chunkCount = await ctx.chunkModel.countByFileId(input.id);

      return {
        ...item,
        chunkCount,
        chunkingError: chunkingTask?.error,
        chunkingStatus: chunkingTask?.status as AsyncTaskStatus,
        embeddingError: embeddingTask?.error,
        embeddingStatus: embeddingTask?.status as AsyncTaskStatus,
        finishEmbedding: embeddingTask?.status === AsyncTaskStatus.Success,
        url: getFullFileUrl(item.url!),
      };
    }),

  getFiles: fileProcedure.input(QueryFileListSchema).query(async ({ ctx, input }) => {
    const fileList = await ctx.fileModel.query(input);

    const fileIds = fileList.map((item) => item.id);
    const chunks = await ctx.chunkModel.countByFileIds(fileIds);

    const chunkTaskIds = fileList.map((result) => result.chunkTaskId).filter(Boolean) as string[];

    const chunkTasks = await ctx.asyncTaskModel.findByIds(chunkTaskIds, AsyncTaskType.Chunking);

    const embeddingTaskIds = fileList
      .map((result) => result.embeddingTaskId)
      .filter(Boolean) as string[];
    const embeddingTasks = await ctx.asyncTaskModel.findByIds(
      embeddingTaskIds,
      AsyncTaskType.Embedding,
    );

    return fileList.map(({ chunkTaskId, embeddingTaskId, ...item }): FileListItem => {
      const chunkTask = chunkTaskId ? chunkTasks.find((task) => task.id === chunkTaskId) : null;
      const embeddingTask = embeddingTaskId
        ? embeddingTasks.find((task) => task.id === embeddingTaskId)
        : null;

      return {
        ...item,
        chunkCount: chunks.find((chunk) => chunk.id === item.id)?.count ?? null,
        chunkingError: chunkTask?.error ?? null,
        chunkingStatus: chunkTask?.status as AsyncTaskStatus,
        embeddingError: embeddingTask?.error ?? null,
        embeddingStatus: embeddingTask?.status as AsyncTaskStatus,
        finishEmbedding: embeddingTask?.status === AsyncTaskStatus.Success,
        url: getFullFileUrl(item.url!),
      };
    });
  }),

  removeAllFiles: fileProcedure.mutation(async ({ ctx }) => {
    return ctx.fileModel.clear();
  }),

  removeFile: fileProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const file = await ctx.fileModel.delete(input.id);

    // delete the orphan chunks
    await ctx.chunkModel.deleteOrphanChunks();
    if (!file) return;

    // delele the file from remove from S3 if it is not used by other files
    const s3Client = new S3();
    await s3Client.deleteFile(file.url!);
  }),

  removeFiles: fileProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const needToRemoveFileList = await ctx.fileModel.deleteMany(input.ids);

      // delete the orphan chunks
      await ctx.chunkModel.deleteOrphanChunks();

      if (!needToRemoveFileList || needToRemoveFileList.length === 0) return;

      // remove from S3
      const s3Client = new S3();

      await s3Client.deleteFiles(needToRemoveFileList.map((file) => file.url!));
    }),
});

export type FileRouter = typeof fileRouter;
