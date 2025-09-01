import { LLMParams } from '../../../model-bank/src/types/aiModel';
import { FileItem } from '../files';
import { KnowledgeBaseItem } from '../knowledgeBase';
import { FewShots } from '../llm';
import { LobeAgentChatConfig } from './chatConfig';

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

export * from './chatConfig';
