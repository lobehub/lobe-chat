import { z } from 'zod';

import { FileItem } from '@/types/files';
import { KnowledgeBaseItem } from '@/types/knowledgeBase';
import { FewShots, LLMParams } from '@/types/llm';

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

export interface LobeAgentChatConfig {
  autoCreateTopicThreshold: number;
  compressThreshold?: number;
  displayMode?: 'chat' | 'docs';
  enableAutoCreateTopic?: boolean;
  /**
   * 历史消息长度压缩阈值
   */
  enableCompressThreshold?: boolean;
  /**
   * 开启历史记录条数
   */
  enableHistoryCount?: boolean;
  enableMaxTokens?: boolean;

  /**
   * 历史消息条数
   */
  historyCount?: number;
  inputTemplate?: string;
}

export const AgentChatConfigSchema = z.object({
  autoCreateTopicThreshold: z.number().default(2),
  compressThreshold: z.number().optional(),
  displayMode: z.enum(['chat', 'docs']).optional(),
  enableAutoCreateTopic: z.boolean().optional(),
  enableCompressThreshold: z.boolean().optional(),
  enableHistoryCount: z.boolean().optional(),
  enableMaxTokens: z.boolean().optional(),
  historyCount: z.number().optional(),
});

export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];
