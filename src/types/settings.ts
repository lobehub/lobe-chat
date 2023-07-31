import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import type { Locales } from '@/locales/resources';
import type { LanguageModel } from '@/types/llm';
import type { LobeAgentSession } from '@/types/session';

export interface GlobalBaseSettings {
  OPENAI_API_KEY: string;
  avatar: string;
  compressThreshold: number;
  enableCompressThreshold: boolean;
  enableHistoryCount: boolean;
  enableMaxTokens: boolean;
  endpoint: string;
  fontSize: number;
  frequencyPenalty: number;
  historyCount: number;
  language: Locales;
  maxTokens: number;
  model: LanguageModel;
  neutralColor: NeutralColors | '';
  password: string;
  presencePenalty: number;
  primaryColor: PrimaryColors | '';
  temperature: number;
  themeMode: ThemeMode;
  topP: number;
}

export type GlobalDefaultAgent = Partial<LobeAgentSession>;

/**
 * 配置设置
 */
export interface GlobalSettings extends GlobalBaseSettings {
  defaultAgent: GlobalDefaultAgent;
}

export type ConfigKeys = keyof GlobalSettings;
