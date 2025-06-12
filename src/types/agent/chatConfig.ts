/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { z } from 'zod';

import { SearchMode } from '@/types/search';

export interface WorkingModel {
  model: string;
  provider: string;
}

export interface LobeAgentChatConfig {
  displayMode?: 'chat' | 'docs';

  enableAutoCreateTopic?: boolean;
  autoCreateTopicThreshold: number;

  enableMaxTokens?: boolean;

  /**
   * 是否开启推理
   */
  enableReasoning?: boolean;
  /**
   * 自定义推理强度
   */
  enableReasoningEffort?: boolean;
  reasoningBudgetToken?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';

  /**
   * 禁用上下文缓存
   */
  disableContextCaching?: boolean;
  /**
   * 历史消息条数
   */
  historyCount?: number;
  /**
   * 开启历史记录条数
   */
  enableHistoryCount?: boolean;
  /**
   * 历史消息长度压缩阈值
   */
  enableCompressHistory?: boolean;

  inputTemplate?: string;

  searchMode?: SearchMode;
  searchFCModel?: WorkingModel;
  useModelBuiltinSearch?: boolean;
}
/* eslint-enable */

export const AgentChatConfigSchema = z.object({
  autoCreateTopicThreshold: z.number().default(2),
  displayMode: z.enum(['chat', 'docs']).optional(),
  enableAutoCreateTopic: z.boolean().optional(),
  enableCompressHistory: z.boolean().optional(),
  enableHistoryCount: z.boolean().optional(),
  enableMaxTokens: z.boolean().optional(),
  enableReasoning: z.boolean().optional(),
  enableReasoningEffort: z.boolean().optional(),
  historyCount: z.number().optional(),
  reasoningBudgetToken: z.number().optional(),
  searchFCModel: z
    .object({
      model: z.string(),
      provider: z.string(),
    })
    .optional(),
  searchMode: z.enum(['off', 'on', 'auto']).optional(),
});
