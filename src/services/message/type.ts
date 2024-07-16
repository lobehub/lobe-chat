import { DB_Message } from '@/database/client/schemas/message';
import {
  ChatMessage,
  ChatMessageError,
  ChatTTS,
  ChatTranslate,
  MessageRoleType,
} from '@/types/message';

/* eslint-disable typescript-sort-keys/interface */

export interface CreateMessageParams
  extends Partial<Omit<ChatMessage, 'content' | 'role' | 'topicId'>> {
  fromModel?: string;
  fromProvider?: string;
  sessionId: string;
  traceId?: string;
  topicId?: string;
  content: string;
  error?: ChatMessageError | null;
  role: MessageRoleType;
}

export interface IMessageService {
  createMessage(data: CreateMessageParams): Promise<string>;
  batchCreateMessages(messages: ChatMessage[]): Promise<any>;

  getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]>;
  getAllMessages(): Promise<ChatMessage[]>;
  getAllMessagesInSession(sessionId: string): Promise<ChatMessage[]>;
  countMessages(): Promise<number>;
  countTodayMessages(): Promise<number>;

  updateMessageError(id: string, error: ChatMessageError): Promise<any>;
  updateMessage(id: string, message: Partial<DB_Message>): Promise<any>;
  updateMessageTTS(id: string, tts: Partial<ChatTTS> | false): Promise<any>;
  updateMessageTranslate(id: string, translate: Partial<ChatTranslate> | false): Promise<any>;
  updateMessagePluginState(id: string, value: Record<string, any>): Promise<any>;
  bindMessagesToTopic(topicId: string, messageIds: string[]): Promise<any>;

  removeMessage(id: string): Promise<any>;
  removeMessages(ids: string[]): Promise<any>;
  removeMessagesByAssistant(assistantId: string, topicId?: string): Promise<any>;
  removeAllMessages(): Promise<any>;

  hasMessages(): Promise<boolean>;
}
