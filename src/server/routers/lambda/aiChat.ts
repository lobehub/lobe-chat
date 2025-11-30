import {
  AiSendMessageServerSchema,
  SendMessageServerResponse,
  StructureOutputSchema,
} from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import debug from 'debug';

import { LOADING_FLAT } from '@/const/message';
import { MessageModel } from '@/database/models/message';
import { ThreadModel } from '@/database/models/thread';
import { TopicModel } from '@/database/models/topic';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';
import { resolveContext } from '@/server/routers/lambda/_helpers/resolveContext';
import { AiChatService } from '@/server/services/aiChat';
import { FileService } from '@/server/services/file';
import { getXorPayload } from '@/utils/server';

const log = debug('lobe-lambda-router:ai-chat');

const aiChatProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      aiChatService: new AiChatService(ctx.serverDB, ctx.userId),
      fileService: new FileService(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
      threadModel: new ThreadModel(ctx.serverDB, ctx.userId),
      topicModel: new TopicModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const aiChatRouter = router({
  outputJSON: aiChatProcedure.input(StructureOutputSchema).mutation(async ({ input }) => {
    log('outputJSON called with provider: %s, model: %s', input.provider, input.model);
    log('messages count: %d', input.messages.length);
    log('schema: %O', input.schema);

    let payload: object | undefined;

    try {
      payload = getXorPayload(input.keyVaultsPayload);
      log('payload parsed successfully');
    } catch (e) {
      log('payload parse error: %O', e);
      console.warn('user payload parse error', e);
    }

    if (!payload) {
      log('payload is empty, throwing error');
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'keyVaultsPayload is not correct' });
    }

    log('initializing model runtime with provider: %s', input.provider);
    const modelRuntime = initModelRuntimeWithUserPayload(input.provider, payload);

    log('calling generateObject');
    const result = await modelRuntime.generateObject({
      messages: input.messages,
      model: input.model,
      schema: input.schema,
      tools: input.tools,
    });

    log('generateObject completed, result: %O', result);
    return result;
  }),

  sendMessageInServer: aiChatProcedure
    .input(AiSendMessageServerSchema)
    .mutation(async ({ input, ctx }) => {
      log('sendMessageInServer called for agentId: %s', input.agentId);
      log(
        'topicId: %s, newTopic: %O, newThread: %O',
        input.topicId,
        input.newTopic,
        input.newThread,
      );
      let sessionId = input.sessionId;
      if (!sessionId) {
        const context = await resolveContext(input, ctx.serverDB, ctx.userId);
        if (!!context.sessionId) sessionId = context.sessionId;
      }

      let messageId: string;
      let topicId = input.topicId!;
      let threadId = input.threadId;
      let createdThreadId: string | undefined;

      let isCreateNewTopic = false;

      // create topic if there should be a new topic
      if (input.newTopic) {
        log('creating new topic with title: %s', input.newTopic.title);
        const topicItem = await ctx.topicModel.create({
          messages: input.newTopic.topicMessageIds,
          sessionId,
          title: input.newTopic.title,
        });
        topicId = topicItem.id;
        isCreateNewTopic = true;
        log('new topic created with id: %s', topicId);
      }

      // create thread if there should be a new thread
      if (input.newThread) {
        log(
          'creating new thread with sourceMessageId: %s, type: %s',
          input.newThread.sourceMessageId,
          input.newThread.type,
        );
        const threadItem = await ctx.threadModel.create({
          parentThreadId: input.newThread.parentThreadId,
          sourceMessageId: input.newThread.sourceMessageId,
          title: input.newThread.title,
          topicId,
          type: input.newThread.type,
        });
        if (threadItem) {
          threadId = threadItem.id;
          createdThreadId = threadItem.id;
          log('new thread created with id: %s', threadId);
        }
      }

      // create user message
      log('creating user message with content length: %d', input.newUserMessage.content.length);
      const userMessageItem = await ctx.messageModel.create({
        agentId: input.agentId!,
        content: input.newUserMessage.content,
        files: input.newUserMessage.files,
        parentId: input.newUserMessage.parentId,
        role: 'user',
        threadId,
        topicId,
      });

      messageId = userMessageItem.id;
      log('user message created with id: %s', messageId);

      // create assistant message
      log(
        'creating assistant message with model: %s, provider: %s',
        input.newAssistantMessage.model,
        input.newAssistantMessage.provider,
      );
      const assistantMessageItem = await ctx.messageModel.create({
        agentId: input.agentId!,
        content: LOADING_FLAT,
        model: input.newAssistantMessage.model,
        parentId: messageId,
        provider: input.newAssistantMessage.provider,
        role: 'assistant',
        threadId,
        topicId,
      });
      log('assistant message created with id: %s', assistantMessageItem.id);

      // retrieve latest messages and topic with
      log('retrieving messages and topics');
      const { messages, topics } = await ctx.aiChatService.getMessagesAndTopics({
        agentId: input.agentId!,
        includeTopic: isCreateNewTopic,
        topicId,
      });

      log('retrieved %d messages, %d topics', messages.length, topics?.length ?? 0);

      return {
        assistantMessageId: assistantMessageItem.id,
        createdThreadId,
        isCreateNewTopic,
        messages,
        topicId,
        topics,
        userMessageId: messageId,
      } as SendMessageServerResponse;
    }),
});
