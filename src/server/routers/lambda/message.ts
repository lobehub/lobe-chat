import {
  CreateNewMessageParamsSchema,
  UpdateMessageParamsSchema,
  UpdateMessagePluginSchema,
  UpdateMessageRAGParamsSchema,
} from '@lobechat/types';
import { z } from 'zod';

import { MessageModel } from '@/database/models/message';
import { getServerDB } from '@/database/server';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { FileService } from '@/server/services/file';
import { MessageService } from '@/server/services/message';

const messageProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      fileService: new FileService(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
      messageService: new MessageService(ctx.serverDB, ctx.userId),
    },
  });
});

export const messageRouter = router({
  count: messageProcedure
    .input(
      z
        .object({
          endDate: z.string().optional(),
          range: z.tuple([z.string(), z.string()]).optional(),
          startDate: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.messageModel.count(input);
    }),

  countWords: messageProcedure
    .input(
      z
        .object({
          endDate: z.string().optional(),
          range: z.tuple([z.string(), z.string()]).optional(),
          startDate: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.messageModel.countWords(input);
    }),

  createMessage: messageProcedure
    .input(CreateNewMessageParamsSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.messageService.createMessage(input as any);
    }),

  getHeatmaps: messageProcedure.query(async ({ ctx }) => {
    return ctx.messageModel.getHeatmaps();
  }),

  // TODO: 未来这部分方法也需要使用 authedProcedure
  getMessages: publicProcedure
    .input(
      z.object({
        current: z.number().optional(),
        groupId: z.string().nullable().optional(),
        pageSize: z.number().optional(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) return [];
      const serverDB = await getServerDB();

      const messageModel = new MessageModel(serverDB, ctx.userId);
      const fileService = new FileService(serverDB, ctx.userId);

      return messageModel.query(input, {
        groupAssistantMessages: false,
        postProcessUrl: (path) => fileService.getFullFileUrl(path),
      });
    }),

  rankModels: messageProcedure.query(async ({ ctx }) => {
    return ctx.messageModel.rankModels();
  }),

  removeAllMessages: messageProcedure.mutation(async ({ ctx }) => {
    return ctx.messageModel.deleteAllMessages();
  }),

  removeMessage: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...options } = input;
      return ctx.messageService.removeMessage(id, options);
    }),

  removeMessageQuery: messageProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.deleteMessageQuery(input.id);
    }),

  removeMessages: messageProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { ids, ...options } = input;
      return ctx.messageService.removeMessages(ids, options);
    }),

  removeMessagesByAssistant: messageProcedure
    .input(
      z.object({
        groupId: z.string().nullable().optional(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.deleteMessagesBySession(
        input.sessionId,
        input.topicId,
        input.groupId,
      );
    }),

  removeMessagesByGroup: messageProcedure
    .input(
      z.object({
        groupId: z.string(),
        topicId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.deleteMessagesBySession(null, input.topicId, input.groupId);
    }),

  searchMessages: messageProcedure
    .input(z.object({ keywords: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.messageModel.queryByKeyword(input.keywords);
    }),

  update: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        value: UpdateMessageParamsSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, value, ...options } = input;
      return ctx.messageService.updateMessage(id, value as any, options);
    }),

  updateMessagePlugin: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        value: UpdateMessagePluginSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, value, ...options } = input;
      return ctx.messageService.updateMessagePlugin(id, value, options);
    }),

  updateMessageRAG: messageProcedure
    .input(
      UpdateMessageRAGParamsSchema.extend({
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, value, ...options } = input;
      return ctx.messageService.updateMessageRAG(id, value, options);
    }),

  updateMetadata: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        value: z.object({}).passthrough(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, value, ...options } = input;
      return ctx.messageService.updateMetadata(id, value, options);
    }),

  updatePluginError: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        value: z.object({}).passthrough().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, value, ...options } = input;
      return ctx.messageService.updatePluginError(id, value, options);
    }),

  updatePluginState: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        value: z.object({}).passthrough(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, value, ...options } = input;
      return ctx.messageService.updatePluginState(id, value, options);
    }),

  updateTTS: messageProcedure
    .input(
      z.object({
        id: z.string(),
        value: z
          .object({
            contentMd5: z.string().optional(),
            file: z.string().optional(),
            voice: z.string().optional(),
          })
          .or(z.literal(false)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.value === false) {
        return ctx.messageModel.deleteMessageTTS(input.id);
      }

      return ctx.messageModel.updateTTS(input.id, input.value);
    }),
  updateTranslate: messageProcedure
    .input(
      z.object({
        id: z.string(),
        value: z
          .object({
            content: z.string().optional(),
            from: z.string().optional(),
            to: z.string(),
          })
          .or(z.literal(false)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.value === false) {
        return ctx.messageModel.deleteMessageTranslate(input.id);
      }

      return ctx.messageModel.updateTranslate(input.id, input.value);
    }),
});
