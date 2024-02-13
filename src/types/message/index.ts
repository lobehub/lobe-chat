import { IPluginErrorType } from '@lobehub/chat-plugin-sdk';

import { ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ErrorType } from '@/types/fetch';

import { LLMRoleType } from '../llm';
import { BaseDataModel } from '../meta';
import { ChatPluginPayload } from './tools';
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
  parentId?: string;
  plugin?: ChatPluginPayload;
  pluginState?: any;

  // 引用
  quotaId?: string;
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;
  sessionId?: string;
  /**
   * 保存到主题的消息
   */
  topicId?: string;

  /**
   * 观测 id
   */
  traceId?: string;
}

export type ChatMessageMap = Record<string, ChatMessage>;
