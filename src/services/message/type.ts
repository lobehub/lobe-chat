import { DB_Message } from '@/database/client/schemas/message';
import { ChatMessage, ChatMessageError, ChatPluginPayload } from '@/types/message';

/* eslint-disable typescript-sort-keys/interface */

export interface CreateMessageParams
  extends Partial<Omit<ChatMessage, 'content' | 'role'>>,
    Pick<ChatMessage, 'content' | 'role'> {
  fromModel?: string;
  fromProvider?: string;
  sessionId: string;
  traceId?: string;
}

export interface IMessageService {
  createMessage(data: CreateMessageParams): Promise<string>;
  batchCreateMessages(messages: ChatMessage[]): Promise<any>;

  getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]>;
  getAllMessages(): Promise<ChatMessage[]>;
  getAllMessagesInSession(sessionId: string): Promise<ChatMessage[]>;
  countMessages(): Promise<number>;

  updateMessageError(id: string, error: ChatMessageError): Promise<any>;
  updateMessage(id: string, message: Partial<DB_Message>): Promise<any>;
  updateMessagePlugin(id: string, plugin: ChatPluginPayload): Promise<any>;
  updateMessagePluginState(id: string, key: string, value: any): Promise<any>;
  bindMessagesToTopic(topicId: string, messageIds: string[]): Promise<any>;

  removeMessage(id: string): Promise<any>;
  removeMessages(assistantId: string, topicId?: string): Promise<any>;
  removeAllMessages(): Promise<any>;
}
