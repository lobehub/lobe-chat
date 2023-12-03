import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import { LocaleMode } from '@/types/locale';
import type { LobeAgentSession } from '@/types/session';

export interface GlobalBaseSettings {
  /**
   * @deprecated
   */
  OPENAI_API_KEY?: string;

  avatar: string;
  /**
   * @deprecated
   */
  compressThreshold?: number;
  /**
   * @deprecated
   */
  enableCompressThreshold?: boolean;
  /**
   * @deprecated
   */
  enableHistoryCount?: boolean;
  /**
   * @deprecated
   */
  enableMaxTokens?: boolean;
  /**
   * @deprecated
   */
  endpoint?: string;
  fontSize: number;
  /**
   * @deprecated
   */
  historyCount?: number;
  language: LocaleMode;
  neutralColor?: NeutralColors;
  password: string;
  primaryColor?: PrimaryColors;
  themeMode: ThemeMode;
}

export type GlobalDefaultAgent = Pick<LobeAgentSession, 'config' | 'meta'>;

export type CustomModels = { displayName: string; name: string }[];

export interface OpenAIConfig {
  OPENAI_API_KEY: string;
  azureApiVersion?: string;
  /**
   * custom mode name for fine-tuning or openai like model
   */
  customModelName?: string;
  endpoint?: string;
  models?: string[];
  useAzure?: boolean;
}

export interface GlobalLLMConfig {
  openAI: OpenAIConfig;
}

export type STTServer = 'openai' | 'browser';
export interface GlobalTTSConfig {
  openAI: {
    sttModel: 'whisper-1';
    ttsModel: 'tts-1' | 'tts-1-hd';
  };
  sttAutoStop: boolean;
  sttServer: STTServer;
}

export type LLMBrand = keyof GlobalLLMConfig;

/**
 * 配置设置
 */
export interface GlobalSettings extends GlobalBaseSettings {
  defaultAgent: GlobalDefaultAgent;
  languageModel: GlobalLLMConfig;
  tts: GlobalTTSConfig;
}

export type ConfigKeys = keyof GlobalSettings;
