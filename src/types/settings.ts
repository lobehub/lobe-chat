import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import type { Locales } from '@/locales/resources';
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
  language: Locales;
  neutralColor: NeutralColors | '';
  password: string;
  primaryColor: PrimaryColors | '';
  themeMode: ThemeMode;
}

export type GlobalDefaultAgent = Pick<LobeAgentSession, 'config' | 'meta'>;

interface OpenAIConfig {
  OPENAI_API_KEY: string;
  azureApiVersion?: string;
  endpoint?: string;
  models?: string[];
  useAzure?: boolean;
}

export type GlobalLLMConfig = {
  openAI: OpenAIConfig;
};

export type LLMBrand = keyof GlobalLLMConfig;

/**
 * 配置设置
 */
export interface GlobalSettings extends GlobalBaseSettings {
  defaultAgent: GlobalDefaultAgent;
  languageModel: GlobalLLMConfig;
}

export type ConfigKeys = keyof GlobalSettings;
