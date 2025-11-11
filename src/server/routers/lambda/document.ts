import { z } from 'zod';

import { ChunkModel } from '@/database/models/chunk';
import { FileModel } from '@/database/models/file';
import { MessageModel } from '@/database/models/message';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { DocumentService } from '@/server/services/document';

const documentProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      chunkModel: new ChunkModel(ctx.serverDB, ctx.userId),
      documentService: new DocumentService(ctx.serverDB, ctx.userId),
      fileModel: new FileModel(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const documentRouter = router({
  createDocument: documentProcedure
    .input(
      z.object({
        content: z.string().optional(),
        editorData: z.string(),
        fileType: z.string().optional(),
        knowledgeBaseId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Parse editorData from JSON string to object
      const editorData = JSON.parse(input.editorData);
      return ctx.documentService.createDocument({
        ...input,
        editorData,
      });
    }),

  deleteDocument: documentProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.documentService.deleteDocument(input.id);
    }),

  getDocumentById: documentProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.documentService.getDocumentById(input.id);
    }),

  parseFileContent: documentProcedure
    .input(
      z.object({
        id: z.string(),
        skipExist: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lobeDocument = await ctx.documentService.parseFile(input.id);

      return lobeDocument;
    }),

  queryDocuments: documentProcedure.query(async ({ ctx }) => {
    return ctx.documentService.queryDocuments();
  }),

  updateDocument: documentProcedure
    .input(
      z.object({
        content: z.string().optional(),
        editorData: z.string().optional(),
        id: z.string(),
        metadata: z.record(z.any()).optional(),
        rawData: z.string().optional(),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, editorData: editorDataString, ...params } = input;
      // Parse editorData from JSON string to object if present
      const editorData = editorDataString ? JSON.parse(editorDataString) : undefined;
      return ctx.documentService.updateDocument(id, {
        ...params,
        editorData,
      });
    }),
});
