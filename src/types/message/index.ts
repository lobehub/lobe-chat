import { IPluginErrorType } from '@lobehub/chat-plugin-sdk';

import { ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ErrorType } from '@/types/fetch';
import { UploadFileItem } from '@/types/files';
import { MessageSemanticSearchChunk } from '@/types/rag';

import { BaseDataModel } from '../meta';
import { ChatPluginPayload, ChatToolPayload } from './tools';
import { Translate } from './translate';

export type MessageRoleType = 'user' | 'system' | 'assistant' | 'tool';

/**
 * 聊天消息错误对象
 */
export interface ChatMessageError {
  body?: any;
  message: string;
  type: ErrorType | IPluginErrorType | ILobeAgentRuntimeErrorType;
}

export interface ChatTranslate extends Translate {
  content?: string;
}

export interface ChatTTS {
  contentMd5?: string;
  file?: string;
  voice?: string;
}

export * from './tools';

export interface ChatFileItem {
  fileType: string;
  id: string;
  name: string;
  size: number;
  url: string;
}

export interface ChatImageItem {
  alt: string;
  id: string;
  url: string;
}

export interface ChatFileChunk {
  fileId: string;
  fileType: string;
  fileUrl: string;
  filename: string;
  id: string;
  similarity?: number;
  text: string;
}

export interface ChatMessageExtra {
  fromModel?: string;
  fromProvider?: string;
  // 翻译
  translate?: ChatTranslate | false | null;
  // TTS
  tts?: ChatTTS;
}

export interface ChatMessage extends BaseDataModel {
  chunksList?: ChatFileChunk[];
  content: string;
  error?: ChatMessageError | null;

  // 扩展字段
  extra?: ChatMessageExtra;
  fileList?: ChatFileItem[];
  /**
   * this is a deprecated field, only use in client db
   * and should be remove after migrate to pglite
   * this field is replaced by fileList and imageList
   * @deprecated
   */
  files?: string[];
  imageList?: ChatImageItem[];
  /**
   * observation id
   */
  observationId?: string;

  /**
   * parent message id
   */
  parentId?: string;
  plugin?: ChatPluginPayload;

  pluginState?: any;
  /**
   * quoted other message's id
   */
  quotaId?: string;
  ragQuery?: string | null;
  ragQueryId?: string | null;
  ragRawQuery?: string | null;
  /**
   * message role type
   */
  role: MessageRoleType;

  sessionId?: string;
  threadId?: string | null;

  tool_call_id?: string;
  tools?: ChatToolPayload[];
  /**
   * 保存到主题的消息
   */
  topicId?: string;
  /**
   * 观测链路 id
   */
  traceId?: string;
}

export type ChatMessageMap = Record<string, ChatMessage>;

export interface CreateMessageParams
  extends Partial<Omit<ChatMessage, 'content' | 'role' | 'topicId' | 'chunksList'>> {
  content: string;
  error?: ChatMessageError | null;
  fileChunks?: MessageSemanticSearchChunk[];
  files?: string[];
  fromModel?: string;
  fromProvider?: string;
  role: MessageRoleType;
  sessionId: string;
  threadId?: string | null;
  topicId?: string;
  traceId?: string;
}

export interface SendMessageParams {
  /**
   * create a thread
   */
  createThread?: boolean;
  files?: UploadFileItem[];
  /**
   *
   * https://github.com/lobehub/lobe-chat/pull/2086
   */
  isWelcomeQuestion?: boolean;
  message: string;
  onlyAddUserMessage?: boolean;
}

export interface SendThreadMessageParams {
  /**
   * create a thread
   */
  createNewThread?: boolean;
  // files?: UploadFileItem[];
  message: string;
  onlyAddUserMessage?: boolean;
}
