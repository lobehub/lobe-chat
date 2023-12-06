import { ErrorType } from '@/types/fetch';
import { Translate } from '@/types/translate';

import { LLMRoleType } from './llm';
import { BaseDataModel } from './meta';

/**
 * 聊天消息错误对象
 */
export interface ChatMessageError {
  body?: any;
  message: string;
  type: ErrorType;
}

export interface ChatTranslate extends Translate {
  content?: string;
}

export interface ChatTTS {
  contentMd5?: string;
  file?: string;
  voice?: string;
}

export interface ChatPluginPayload {
  apiName: string;
  arguments: string;
  identifier: string;
  type: 'standalone' | 'default';
}

export interface ChatMessage extends BaseDataModel {
  content: string;
  error?: any;
  // 扩展字段
  extra?: {
    fromModel?: string;
    // 翻译
    translate?: ChatTranslate | null;
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
}

export type ChatMessageMap = Record<string, ChatMessage>;
