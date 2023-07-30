import { NeutralColors, PrimaryColors } from '@lobehub/ui';
import { ThemeMode } from 'antd-style';

import { Locales } from '@/locales/resources';
import { LanguageModel } from '@/types/llm';

/**
 * 配置设置
 */
export interface GlobalSettings {
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
export type ConfigKeys = keyof GlobalSettings;
