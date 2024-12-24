/* eslint-disable @typescript-eslint/no-unused-vars */
import { INBOX_SESSION_ID } from '@/const/session';
import { MessageItem } from '@/database/schemas';
import { lambdaClient } from '@/libs/trpc/client';
import {
  ChatMessage,
  ChatMessageError,
  ChatTTS,
  ChatTranslate,
  CreateMessageParams,
} from '@/types/message';

import { IMessageService } from './type';

export class ServerService implements IMessageService {
  createMessage = async ({ sessionId, ...params }: CreateMessageParams): Promise<string> => {
    return lambdaClient.message.createMessage.mutate({
      ...params,
      sessionId: this.toDbSessionId(sessionId),
    });
  };

  batchCreateMessages = async (messages: MessageItem[]): Promise<any> => {
    return lambdaClient.message.batchCreateMessages.mutate(messages);
  };

  getMessages = async (sessionId?: string, topicId?: string | undefined) => {
    const data = await lambdaClient.message.getMessages.query({
      sessionId: this.toDbSessionId(sessionId),
      topicId,
    });

    return data as unknown as ChatMessage[];
  };

  getAllMessages = async (): Promise<ChatMessage[]> => {
    return lambdaClient.message.getAllMessages.query();
  };

  getAllMessagesInSession = async (sessionId: string): Promise<ChatMessage[]> => {
    return lambdaClient.message.getAllMessagesInSession.query({
      sessionId: this.toDbSessionId(sessionId),
    });
  };

  countMessages = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    return lambdaClient.message.count.query(params);
  };

  updateMessageError = async (id: string, error: ChatMessageError): Promise<any> => {
    return lambdaClient.message.update.mutate({
      id,
      value: { error },
    });
  };
  updateMessagePluginArguments = async (
    id: string,
    value: string | Record<string, any>,
  ): Promise<any> => {
    const args = typeof value === 'string' ? value : JSON.stringify(value);

    return lambdaClient.message.updateMessagePlugin.mutate({ id, value: { arguments: args } });
  };

  updateMessage = async (id: string, message: Partial<MessageItem>): Promise<any> => {
    return lambdaClient.message.update.mutate({
      id,
      value: message,
    });
  };

  updateMessageTranslate = async (
    id: string,
    translate: Partial<ChatTranslate> | false,
  ): Promise<any> => {
    return lambdaClient.message.updateTranslate.mutate({ id, value: translate as ChatTranslate });
  };

  updateMessageTTS = async (id: string, tts: Partial<ChatTTS> | false): Promise<any> => {
    return lambdaClient.message.updateTTS.mutate({
      id,
      value: tts,
    });
  };

  updateMessagePluginState = async (id: string, value: any): Promise<any> => {
    return lambdaClient.message.updatePluginState.mutate({
      id,
      value,
    });
  };

  removeMessage = async (id: string): Promise<any> => {
    return lambdaClient.message.removeMessage.mutate({ id });
  };

  removeMessages = async (ids: string[]): Promise<any> => {
    return lambdaClient.message.removeMessages.mutate({ ids });
  };

  removeMessagesByAssistant = async (
    sessionId: string,
    topicId?: string | undefined,
  ): Promise<any> => {
    return lambdaClient.message.removeMessagesByAssistant.mutate({
      sessionId: this.toDbSessionId(sessionId),
      topicId,
    });
  };

  removeAllMessages = async (): Promise<any> => {
    return lambdaClient.message.removeAllMessages.mutate();
  };

  private toDbSessionId = (sessionId: string | undefined) => {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  };

  hasMessages = async () => {
    const number = await this.countMessages();
    return number > 0;
  };

  messageCountToCheckTrace = async () => {
    const number = await this.countMessages();
    return number >= 4;
  };
}
