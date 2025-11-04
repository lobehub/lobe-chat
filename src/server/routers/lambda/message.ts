import {
  CreateNewMessageParamsSchema,
  UpdateMessageParamsSchema,
  UpdateMessageRAGParamsSchema,
} from '@lobechat/types';
import { z } from 'zod';

import { MessageModel } from '@/database/models/message';
import { updateMessagePluginSchema } from '@/database/schemas';
import { getServerDB } from '@/database/server';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { FileService } from '@/server/services/file';

const messageProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      fileService: new FileService(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
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

  createNewMessage: messageProcedure
    .input(CreateNewMessageParamsSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.createNewMessage(input as any, {
        postProcessUrl: (path) => ctx.fileService.getFullFileUrl(path),
      });
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
        useGroup: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) return [];
      const serverDB = await getServerDB();

      const { useGroup, ...queryParams } = input;

      const messageModel = new MessageModel(serverDB, ctx.userId);
      const fileService = new FileService(serverDB, ctx.userId);

      return messageModel.query(queryParams, {
        groupAssistantMessages: useGroup ?? false,
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
        useGroup: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.messageModel.deleteMessage(input.id);

      // If sessionId or topicId is provided, return the full message list
      if (input.sessionId !== undefined || input.topicId !== undefined) {
        const messageList = await ctx.messageModel.query(
          {
            sessionId: input.sessionId,
            topicId: input.topicId,
          },
          {
            groupAssistantMessages: input.useGroup ?? false,
            postProcessUrl: (path) => ctx.fileService.getFullFileUrl(path),
          },
        );
        return { messages: messageList, success: true };
      }
      return { success: true };
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
        useGroup: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.messageModel.deleteMessages(input.ids);

      // If sessionId or topicId is provided, return the full message list
      if (input.sessionId !== undefined || input.topicId !== undefined) {
        const messageList = await ctx.messageModel.query(
          {
            sessionId: input.sessionId,
            topicId: input.topicId,
          },
          {
            groupAssistantMessages: input.useGroup ?? false,
            postProcessUrl: (path) => ctx.fileService.getFullFileUrl(path),
          },
        );
        return { messages: messageList, success: true };
      }
      return { success: true };
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
        useGroup: z.boolean().optional(),
        value: UpdateMessageParamsSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.update(input.id, input.value as any, {
        groupAssistantMessages: input.useGroup ?? false,
        postProcessUrl: (path) => ctx.fileService.getFullFileUrl(path),
        sessionId: input.sessionId,
        topicId: input.topicId,
      });
    }),

  updateMessagePlugin: messageProcedure
    .input(
      z.object({
        id: z.string(),
        value: updateMessagePluginSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.updateMessagePlugin(input.id, input.value);
    }),

  updateMessageRAG: messageProcedure
    .input(
      UpdateMessageRAGParamsSchema.extend({
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        useGroup: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.messageModel.updateMessageRAG(input.id, input.value);

      // If sessionId or topicId is provided, return the full message list
      if (input.sessionId !== undefined || input.topicId !== undefined) {
        const messageList = await ctx.messageModel.query(
          {
            sessionId: input.sessionId,
            topicId: input.topicId,
          },
          {
            groupAssistantMessages: input.useGroup ?? false,
            postProcessUrl: (path) => ctx.fileService.getFullFileUrl(path),
          },
        );
        return { messages: messageList, success: true };
      }
      return { success: true };
    }),

  updateMetadata: messageProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.object({}).passthrough(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.updateMetadata(input.id, input.value);
    }),

  updatePluginError: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        useGroup: z.boolean().optional(),
        value: z.object({}).passthrough().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // If sessionId or topicId is provided, we need to return the full message list
      if (input.sessionId !== undefined || input.topicId !== undefined) {
        await ctx.messageModel.updateMessagePlugin(input.id, { error: input.value });
        const messageList = await ctx.messageModel.query(
          {
            sessionId: input.sessionId,
            topicId: input.topicId,
          },
          {
            groupAssistantMessages: input.useGroup ?? false,
            postProcessUrl: (path) => ctx.fileService.getFullFileUrl(path),
          },
        );
        return { messages: messageList, success: true };
      }
      await ctx.messageModel.updateMessagePlugin(input.id, { error: input.value });
      return { success: true };
    }),

  updatePluginState: messageProcedure
    .input(
      z.object({
        id: z.string(),
        sessionId: z.string().nullable().optional(),
        topicId: z.string().nullable().optional(),
        useGroup: z.boolean().optional(),
        value: z.object({}).passthrough(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.messageModel.updatePluginState(input.id, input.value, {
        groupAssistantMessages: input.useGroup ?? false,
        postProcessUrl: (path) => ctx.fileService.getFullFileUrl(path),
        sessionId: input.sessionId,
        topicId: input.topicId,
      });
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
