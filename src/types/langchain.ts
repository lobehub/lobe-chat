import { ChatMessage } from '@lobehub/ui';

export interface LangChainParams {
  llm: {
    model: string;
    /**
     *  生成文本的随机度量，用于控制文本的创造性和多样性
     * @default 0.6
     */
    temperature: number;
    /**
     *  控制生成文本中最高概率的单个令牌
     */
    top_p?: number;
    /**
     *  控制生成文本中的惩罚系数，用于减少重复性
     */
    frequency_penalty?: number;
    /**
     *  控制生成文本中的惩罚系数，用于减少主题的变化
     */
    presence_penalty?: number;
    /**
     *  生成文本的最大长度
     */
    max_tokens?: number;
  };

  /**
   *  聊天信息列表
   */
  prompts: ChatMessage[];
  vars: Record<string, string>;
}
