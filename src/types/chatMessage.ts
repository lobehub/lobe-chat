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
  archive?: boolean;

  /**
   * @title 内容
   * @description 消息内容
   */
  content: string;
  error?: any;

  // 扩展字段
  extra?: {
    // 翻译
    translate: {
      target: string;
      to: string;
    };
    // 语音
  } & Record<string, any>;

  parentId?: string;
  // 引用
  quotaId?: string;
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;
}

export type ChatMessageMap = Record<string, ChatMessage>;
