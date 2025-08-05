/**
 * 移动端 LLM 类型定义
 * 复制自 web 端，保持完全一致
 */

export type LLMRoleType = 'user' | 'system' | 'assistant' | 'tool';

export interface LLMMessage {
  content: string;
  role: LLMRoleType;
}

export type FewShots = LLMMessage[];

// 语言模型的设置参数
export interface LLMParams {
  /**
   * 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;
  /**
   * 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 1
   */
  reasoning_effort?: string;
  /**
   * 控制模型推理能力
   * @default medium
   */
  temperature?: number;
  /**
   * 控制生成文本中最高概率的单个 token
   * @default 1
   */
  top_p?: number;
}
