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
   * @title 内容
   * @description 消息内容
   */
  content: string;
  error?: any;
  // 扩展字段
  extra?: {
    fromModel?: string;
    // 翻译
    translate?: {
      target: string;
      to: string;
    };
  } & Record<string, any>;

  function_call?: { arguments?: string; name: string };
  name?: string;

  parentId?: string;
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
