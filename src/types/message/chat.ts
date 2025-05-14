import { IPluginErrorType } from '@lobehub/chat-plugin-sdk';

import { ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ErrorType } from '@/types/fetch';
import { MetaData } from '@/types/meta';
import { MessageSemanticSearchChunk } from '@/types/rag';
import { GroundingSearch } from '@/types/search';

import { MessageMetadata, MessageRoleType, ModelReasoning } from './base';
import { ChatImageItem } from './image';
import { ChatPluginPayload, ChatToolPayload } from './tools';
import { Translate } from './translate';

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

export interface ChatFileItem {
  content?: string;
  fileType: string;
  id: string;
  name: string;
  size: number;
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

export interface ChatMessage {
  chunksList?: ChatFileChunk[];
  content: string;
  createdAt: number;
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
  id: string;
  imageList?: ChatImageItem[];
  meta: MetaData;

  metadata?: MessageMetadata | null;
  /**
   * observation id
   */
  observationId?: string;

  /**
   * parent message id
   */
  parentId?: string;
  plugin?: ChatPluginPayload;
  pluginError?: any;
  pluginState?: any;
  /**
   * quoted other message's id
   */
  quotaId?: string;
  ragQuery?: string | null;
  ragQueryId?: string | null;

  ragRawQuery?: string | null;
  reasoning?: ModelReasoning | null;
  /**
   * message role type
   */
  role: MessageRoleType;

  search?: GroundingSearch | null;
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
  updatedAt: number;
}

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
