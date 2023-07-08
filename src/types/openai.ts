import { LLMRoleType } from '@/types/llm';

export interface OpenAIChatMessage {
  /**
   * @title 内容
   * @description 消息内容
   */
  content: string;

  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;
}
