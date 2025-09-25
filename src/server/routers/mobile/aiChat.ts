import {
  AiSendMessageServerSchema,
  SendMessageServerResponse,
  StructureOutputSchema,
} from '@lobechat/types';
import { TRPCError } from '@trpc/server';

import { LOADING_FLAT } from '@/const/message';
import { MessageModel } from '@/database/models/message';
import { TopicModel } from '@/database/models/topic';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';
import { AiChatService } from '@/server/services/aiChat';
import { FileService } from '@/server/services/file';
import { getXorPayload } from '@/utils/server';

const aiChatProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      aiChatService: new AiChatService(ctx.serverDB, ctx.userId),
      fileService: new FileService(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
      topicModel: new TopicModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const aiChatRouter = router({
  outputJSON: aiChatProcedure.input(StructureOutputSchema).mutation(async ({ input }) => {
    let payload: object | undefined;

    try {
      payload = getXorPayload(input.keyVaultsPayload);
    } catch (e) {
      console.warn('user payload parse error', e);
    }

    if (!payload) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'keyVaultsPayload is not correct' });
    }

    const modelRuntime = initModelRuntimeWithUserPayload(input.provider, payload);

    return modelRuntime.generateObject({
      messages: input.messages,
      model: input.model,
      schema: input.schema,
    });
  }),

  sendMessageInServer: aiChatProcedure
    .input(AiSendMessageServerSchema)
    .mutation(async ({ input, ctx }) => {
      let messageId: string;
      let topicId = input.topicId!;

      let isCreatNewTopic = false;

      // create topic if there should be a new topic
      if (input.newTopic) {
        const topicItem = await ctx.topicModel.create({
          messages: input.newTopic.topicMessageIds,
          sessionId: input.sessionId,
          title: input.newTopic.title,
        });
        topicId = topicItem.id;
        isCreatNewTopic = true;
      }

      // create user message
      const userMessageItem = await ctx.messageModel.create({
        content: input.newUserMessage.content,
        files: input.newUserMessage.files,
        role: 'user',
        sessionId: input.sessionId!,
        topicId,
      });

      messageId = userMessageItem.id;
      // create assistant message
      const assistantMessageItem = await ctx.messageModel.create({
        content: LOADING_FLAT,
        fromModel: input.newAssistantMessage.model,
        fromProvider: input.newAssistantMessage.provider,
        parentId: messageId,
        role: 'assistant',
        sessionId: input.sessionId!,
        topicId,
      });

      // retrieve latest messages and topic with
      const { messages, topics } = await ctx.aiChatService.getMessagesAndTopics({
        includeTopic: isCreatNewTopic,
        sessionId: input.sessionId,
        topicId,
      });

      return {
        assistantMessageId: assistantMessageItem.id,
        isCreatNewTopic,
        messages,
        topicId,
        topics,
        userMessageId: messageId,
      } as SendMessageServerResponse;
    }),
});
