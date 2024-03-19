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
  autoCreateTopicThreshold: number;
  compressThreshold?: number;
  displayMode?: 'chat' | 'docs';
  enableAutoCreateTopic: boolean;
  /**
   * 历史消息长度压缩阈值
   */
  enableCompressThreshold?: boolean;
  /**
   * 开启历史记录条数
   */
  enableHistoryCount?: boolean;
  enableMaxTokens?: boolean;

  fewShots?: FewShots;
  /**
   * 历史消息条数
   */
  historyCount?: number;
  inputTemplate?: string;
  /**
   * 角色所使用的语言模型
   * @default gpt-3.5-turbo
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

export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];
