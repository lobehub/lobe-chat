/* eslint-disable @typescript-eslint/no-unused-vars */
import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';
import { ChatMessage, ChatMessageError, ChatTranslate } from '@/types/message';

import { IMessageService } from './type';

export class ServerService implements IMessageService {
  createMessage: IMessageService['createMessage'] = async ({ sessionId, ...params }) => {
    return lambdaClient.message.createMessage.mutate({
      ...params,
      sessionId: this.toDbSessionId(sessionId),
    });
  };

  batchCreateMessages: IMessageService['batchCreateMessages'] = async (messages) => {
    return lambdaClient.message.batchCreateMessages.mutate(messages);
  };

  getMessages: IMessageService['getMessages'] = async (sessionId, topicId) => {
    const data = await lambdaClient.message.getMessages.query({
      sessionId: this.toDbSessionId(sessionId),
      topicId,
    });

    return data as unknown as ChatMessage[];
  };

  getAllMessages: IMessageService['getAllMessages'] = async () => {
    return lambdaClient.message.getAllMessages.query();
  };

  getAllMessagesInSession: IMessageService['getAllMessagesInSession'] = async (sessionId) => {
    return lambdaClient.message.getAllMessagesInSession.query({
      sessionId: this.toDbSessionId(sessionId),
    });
  };

  countMessages: IMessageService['countMessages'] = async (params) => {
    return lambdaClient.message.count.query(params);
  };

  countWords: IMessageService['countWords'] = async (params) => {
    return lambdaClient.message.countWords.query(params);
  };

  rankModels: IMessageService['rankModels'] = async () => {
    return lambdaClient.message.rankModels.query();
  };

  getHeatmaps: IMessageService['getHeatmaps'] = async () => {
    return lambdaClient.message.getHeatmaps.query();
  };

  updateMessageError: IMessageService['updateMessageError'] = async (id, error) => {
    return lambdaClient.message.update.mutate({ id, value: { error } });
  };

  updateMessagePluginError = async (id: string, error: ChatMessageError): Promise<any> => {
    return lambdaClient.message.update.mutate({ id, value: { pluginError: error } });
  };

  updateMessagePluginArguments: IMessageService['updateMessagePluginArguments'] = async (
    id,
    value,
  ) => {
    const args = typeof value === 'string' ? value : JSON.stringify(value);
    return lambdaClient.message.updateMessagePlugin.mutate({ id, value: { arguments: args } });
  };

  updateMessage: IMessageService['updateMessage'] = async (id, message) => {
    return lambdaClient.message.update.mutate({ id, value: message });
  };

  updateMessageTranslate: IMessageService['updateMessageTranslate'] = async (id, translate) => {
    return lambdaClient.message.updateTranslate.mutate({ id, value: translate as ChatTranslate });
  };

  updateMessageTTS: IMessageService['updateMessageTTS'] = async (id, tts) => {
    return lambdaClient.message.updateTTS.mutate({ id, value: tts });
  };

  updateMessagePluginState: IMessageService['updateMessagePluginState'] = async (id, value) => {
    return lambdaClient.message.updatePluginState.mutate({ id, value });
  };

  removeMessage: IMessageService['removeMessage'] = async (id) => {
    return lambdaClient.message.removeMessage.mutate({ id });
  };

  removeMessages: IMessageService['removeMessages'] = async (ids) => {
    return lambdaClient.message.removeMessages.mutate({ ids });
  };

  removeMessagesByAssistant: IMessageService['removeMessagesByAssistant'] = async (
    sessionId,
    topicId,
  ) => {
    return lambdaClient.message.removeMessagesByAssistant.mutate({
      sessionId: this.toDbSessionId(sessionId),
      topicId,
    });
  };

  removeAllMessages: IMessageService['removeAllMessages'] = async () => {
    return lambdaClient.message.removeAllMessages.mutate();
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
