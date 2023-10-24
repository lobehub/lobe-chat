import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';

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
export interface OpenAIFunctionCall {
  arguments?: string;
  name: string;
}

export interface ChatTranslate extends Translate {
  content?: string;
}
export interface ChatMessage extends BaseDataModel {
  /**
   * @title 内容
   * @description 消息内容
   */
  content: string;
  error?: any;
  // 扩展字段
  extra?: {
    fromModel?: string;
    // 翻译
    translate?: ChatTranslate;
  } & Record<string, any>;

  /**
   * replace with plugin
   * @deprecated
   */
  function_call?: OpenAIFunctionCall;
  name?: string;

  parentId?: string;

  plugin?: PluginRequestPayload;
  pluginState?: any;

  // 引用
  quotaId?: string;
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;
  /**
   * 保存到主题的消息
   */
  topicId?: string;
}

export type ChatMessageMap = Record<string, ChatMessage>;
