import type { HeatmapsProps } from '@lobehub/charts';

import {
  ChatMessage,
  ChatMessageError,
  ChatMessagePluginError,
  ChatTTS,
  ChatTranslate,
  CreateMessageParams,
  MessageItem,
  ModelRankItem,
  UpdateMessageParams,
} from '@/types/message';
import { UpdateMessageRAGParams } from '@/types/message/rag';

/* eslint-disable typescript-sort-keys/interface */

export interface IMessageService {
  createMessage(data: CreateMessageParams): Promise<string>;
  batchCreateMessages(messages: MessageItem[]): Promise<any>;

  getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]>;
  getAllMessages(): Promise<ChatMessage[]>;
  getAllMessagesInSession(sessionId: string): Promise<ChatMessage[]>;
  countMessages(params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number>;
  countWords(params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number>;
  rankModels(): Promise<ModelRankItem[]>;
  getHeatmaps(): Promise<HeatmapsProps['data']>;
  updateMessageError(id: string, error: ChatMessageError): Promise<any>;
  updateMessage(id: string, message: Partial<UpdateMessageParams>): Promise<any>;
  updateMessageTTS(id: string, tts: Partial<ChatTTS> | false): Promise<any>;
  updateMessageTranslate(id: string, translate: Partial<ChatTranslate> | false): Promise<any>;
  updateMessagePluginState(id: string, value: Record<string, any>): Promise<any>;
  updateMessagePluginError(id: string, value: ChatMessagePluginError | null): Promise<any>;
  updateMessageRAG(id: string, value: UpdateMessageRAGParams): Promise<void>;
  updateMessagePluginArguments(id: string, value: string | Record<string, any>): Promise<any>;
  removeMessage(id: string): Promise<any>;
  removeMessages(ids: string[]): Promise<any>;
  removeMessagesByAssistant(assistantId: string, topicId?: string): Promise<any>;
  removeAllMessages(): Promise<any>;
  messageCountToCheckTrace(): Promise<boolean>;
  hasMessages(): Promise<boolean>;
}
