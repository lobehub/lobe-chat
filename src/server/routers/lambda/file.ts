import { z } from 'zod';

import { FileModel } from '@/database/server/models/file';
import { authedProcedure, router } from '@/libs/trpc';
import { UploadFileSchema } from '@/types/files';

const fileProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { fileModel: new FileModel(ctx.userId) },
  });
});

export const fileRouter = router({
  createFile: fileProcedure
    .input(
      UploadFileSchema.omit({ data: true, saveMode: true, url: true }).extend({ url: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.fileModel.create({
        fileType: input.fileType,
        metadata: input.metadata,
        name: input.name,
        size: input.size,
        url: input.url,
      });
    }),

  findById: fileProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.fileModel.findById(input.id);
    }),

  removeAllFiles: fileProcedure.mutation(async ({ ctx }) => {
    return ctx.fileModel.clear();
  }),

  removeFile: fileProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    return ctx.fileModel.delete(input.id);
  }),
});

export type FileRouter = typeof fileRouter;
