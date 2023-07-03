import { LLMRoleType } from './llm';
import { BaseDataModel } from './meta';

/**
 * 聊天消息错误对象
 */
export interface ChatMessageError {
  /**
   * 错误信息
   */
  message: string;
  status: number;
  type: 'general' | 'llm';
}

export interface ChatMessage extends BaseDataModel {
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;

  /**
   * @title 内容
   * @description 消息内容
   */
  content: string;
  error?: any;

  archive?: boolean;

  parentId?: string;
  // 引用
  quotaId?: string;
  // 扩展字段
  extra?: {
    // 翻译
    translate: {
      to: string;
      target: string;
    };
    // 语音
  } & Record<string, any>;
}

export type ChatMessageMap = Record<string, ChatMessage>;
