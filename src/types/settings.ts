import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import type { Locales } from '@/locales/resources';
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
  historyCount: number;
  language: Locales;
  neutralColor: NeutralColors | '';
  password: string;
  primaryColor: PrimaryColors | '';
  themeMode: ThemeMode;
}

export type GlobalDefaultAgent = Partial<LobeAgentSession>;

/**
 * 配置设置
 */
export interface GlobalSettings extends GlobalBaseSettings {
  defaultAgent: GlobalDefaultAgent;
}

export type ConfigKeys = keyof GlobalSettings;
