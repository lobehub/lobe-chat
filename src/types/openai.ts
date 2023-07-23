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

/**
 * @title OpenAI Stream Payload
 */
export interface OpenAIStreamPayload {
  /**
   * @title 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * @title 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * @title 聊天信息列表
   */
  messages: OpenAIChatMessage[];
  /**
   * @title 模型名称
   */
  model: string;
  /**
   * @title 返回的文本数量
   */
  n?: number;
  /**
   * 开启的插件列表
   */
  plugins?: string[];
  /**
   * @title 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;
  /**
   * @title 是否开启流式请求
   * @default true
   */
  stream?: boolean;
  /**
   * @title 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 0.5
   */
  temperature: number;

  /**
   * @title 控制生成文本中最高概率的单个令牌
   * @default 1
   */
  top_p?: number;
}
