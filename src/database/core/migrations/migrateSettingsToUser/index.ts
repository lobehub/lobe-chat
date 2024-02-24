import { DB_Settings, DB_User } from '@/database/schemas/user';

import { V4Settings } from './type';

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
