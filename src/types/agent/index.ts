import { z } from 'zod';

import { FileItem } from '@/types/files';
import { KnowledgeBaseItem } from '@/types/knowledgeBase';
import { FewShots, LLMParams } from '@/types/llm';
import { SearchMode } from '@/types/search';

export type TTSServer = 'openai' | 'edge' | 'microsoft';

export interface LobeAgentTTSConfig {
  showAllLocaleVoice?: boolean;
  sttLocale: 'auto' | string;
  ttsService: TTSServer;
  voice: {
    edge?: string;
    microsoft?: string;
    openai: string;
  };
}

export interface LobeAgentConfig {
  chatConfig: LobeAgentChatConfig;
  fewShots?: FewShots;
  files?: FileItem[];
  id?: string;
  /**
   * knowledge bases
   */
  knowledgeBases?: KnowledgeBaseItem[];
  /**
   * 角色所使用的语言模型
   * @default gpt-4o-mini
   */
  model: string;
  /**
   * 语言模型参数
   */
  params: LLMParams;
  /**
   * 启用的插件
   */
  plugins?: string[];
  /**
   *  模型供应商
   */
  provider?: string;
  /**
   * 系统角色
   */
  systemRole: string;

  /**
   * 语音服务
   */
  tts: LobeAgentTTSConfig;
}

/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */

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
  searchMode: z.enum(['off', 'on', 'auto']).optional(),
});

export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];
