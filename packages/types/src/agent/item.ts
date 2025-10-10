import { LLMParams } from 'model-bank';

import { FileItem } from '../files';
import { KnowledgeBaseItem } from '../knowledgeBase';
import { FewShots } from '../llm';
import { LobeAgentChatConfig } from './chatConfig';
import { LobeAgentTTSConfig } from './tts';

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
   * 开场白
   */
  openingMessage?: string;
  /**
   * 开场问题
   */
  openingQuestions?: string[];

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

export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];

// Agent database item type (independent from schema)
export interface AgentItem {
  avatar?: string | null;
  backgroundColor?: string | null;
  chatConfig?: LobeAgentChatConfig | null;
  clientId?: string | null;
  createdAt: Date;
  description?: string | null;
  fewShots?: any | null;
  id: string;
  model?: string | null;
  openingMessage?: string | null;
  openingQuestions?: string[];
  params?: any;
  plugins?: string[];
  provider?: string | null;
  slug?: string | null;
  systemRole?: string | null;
  tags?: string[];
  title?: string | null;
  tts?: LobeAgentTTSConfig | null;
  updatedAt: Date;
  userId: string;
}
