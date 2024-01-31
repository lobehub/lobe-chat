import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import { DB_Settings, DB_User } from '@/database/schemas/user';
import { LocaleMode } from '@/types/locale';
import { GlobalDefaultAgent, GlobalLLMConfig, GlobalTTSConfig, GlobalTool } from '@/types/settings';

export interface V4Settings {
  avatar: string;
  defaultAgent: GlobalDefaultAgent;
  fontSize: number;
  language: LocaleMode;
  languageModel: GlobalLLMConfig;
  neutralColor?: NeutralColors;
  password: string;
  primaryColor?: PrimaryColors;
  themeMode: ThemeMode;
  tool: GlobalTool;
  tts: GlobalTTSConfig;
}

export const migrateSettingsToUser = (settings: V4Settings): DB_User => {
  const dbSettings: DB_Settings = {
    defaultAgent: settings.defaultAgent,
    fontSize: settings.fontSize,
    language: settings.language,
    languageModel: {
      openai: settings.languageModel.openAI,
    },
    password: settings.password,
    themeMode: settings.themeMode,
    tts: settings.tts,
  };

  return {
    avatar: settings.avatar,
    settings: dbSettings,
  };
};
