import { IPluginErrorType } from '@lobehub/chat-plugin-sdk';

import { ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ErrorType } from '@/types/fetch';

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

export interface ChatMessage extends BaseDataModel {
  content: string;
  error?: ChatMessageError;
  // 扩展字段
  extra?: {
    fromModel?: string;
    fromProvider?: string;
    // 翻译
    translate?: ChatTranslate | false;
    // TTS
    tts?: ChatTTS;
  } & Record<string, any>;

  files?: string[];
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
  /**
   * message role type
   */
  role: MessageRoleType;
  sessionId?: string;

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
