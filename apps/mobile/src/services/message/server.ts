/* eslint-disable @typescript-eslint/no-unused-vars */
import { INBOX_SESSION_ID } from '@/const/session';
import { ChatMessage, ChatTranslate } from '@/types/message';
import { trpcClient } from '@/services/_auth/trpc';

import { IMessageService } from './type';

export class ServerService implements IMessageService {
  createMessage: IMessageService['createMessage'] = async ({ sessionId, ...params }) => {
    return trpcClient.message.createMessage.mutate({
      ...params,
      sessionId: this.toDbSessionId(sessionId),
    });
  };

  batchCreateMessages: IMessageService['batchCreateMessages'] = async (messages) => {
    return trpcClient.message.batchCreateMessages.mutate(messages);
  };

  getMessages: IMessageService['getMessages'] = async (sessionId, topicId) => {
    const data = await trpcClient.message.getMessages.query({
      sessionId: this.toDbSessionId(sessionId),
      topicId,
    });

    return data as unknown as ChatMessage[];
  };

  getAllMessages: IMessageService['getAllMessages'] = async () => {
    return trpcClient.message.getAllMessages.query();
  };

  getAllMessagesInSession: IMessageService['getAllMessagesInSession'] = async (sessionId) => {
    return trpcClient.message.getAllMessagesInSession.query({
      sessionId: this.toDbSessionId(sessionId),
    });
  };

  countMessages: IMessageService['countMessages'] = async (params) => {
    return trpcClient.message.count.query(params);
  };

  countWords: IMessageService['countWords'] = async (params) => {
    return trpcClient.message.countWords.query(params);
  };

  rankModels: IMessageService['rankModels'] = async () => {
    return trpcClient.message.rankModels.query();
  };

  getHeatmaps: IMessageService['getHeatmaps'] = async () => {
    return trpcClient.message.getHeatmaps.query();
  };

  updateMessageError: IMessageService['updateMessageError'] = async (id, error) => {
    return trpcClient.message.update.mutate({ id, value: { error } });
  };

  updateMessagePluginArguments: IMessageService['updateMessagePluginArguments'] = async (
    id,
    value,
  ) => {
    const args = typeof value === 'string' ? value : JSON.stringify(value);
    return trpcClient.message.updateMessagePlugin.mutate({ id, value: { arguments: args } });
  };

  updateMessage: IMessageService['updateMessage'] = async (id, value) => {
    return trpcClient.message.update.mutate({ id, value });
  };

  updateMessageTranslate: IMessageService['updateMessageTranslate'] = async (id, translate) => {
    return trpcClient.message.updateTranslate.mutate({ id, value: translate as ChatTranslate });
  };

  updateMessageTTS: IMessageService['updateMessageTTS'] = async (id, tts) => {
    return trpcClient.message.updateTTS.mutate({ id, value: tts });
  };

  updateMessagePluginState: IMessageService['updateMessagePluginState'] = async (id, value) => {
    return trpcClient.message.updatePluginState.mutate({ id, value });
  };

  updateMessagePluginError: IMessageService['updateMessagePluginError'] = async (id, error) => {
    return trpcClient.message.updatePluginError.mutate({ id, value: error as any });
  };

  removeMessage: IMessageService['removeMessage'] = async (id) => {
    return trpcClient.message.removeMessage.mutate({ id });
  };

  removeMessages: IMessageService['removeMessages'] = async (ids) => {
    return trpcClient.message.removeMessages.mutate({ ids });
  };

  removeMessagesByAssistant: IMessageService['removeMessagesByAssistant'] = async (
    sessionId,
    topicId,
  ) => {
    return trpcClient.message.removeMessagesByAssistant.mutate({
      sessionId: this.toDbSessionId(sessionId),
      topicId,
    });
  };

  removeAllMessages: IMessageService['removeAllMessages'] = async () => {
    return trpcClient.message.removeAllMessages.mutate();
  };

  private toDbSessionId = (sessionId: string | undefined) => {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  };

  hasMessages: IMessageService['hasMessages'] = async () => {
    const number = await this.countMessages();
    return number > 0;
  };

  messageCountToCheckTrace: IMessageService['messageCountToCheckTrace'] = async () => {
    const number = await this.countMessages();
    return number >= 4;
  };
}
