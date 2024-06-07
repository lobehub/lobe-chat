import { V4Settings, V5Settings } from './type';

export const migrateSettingsToUser = (
  settings: V4Settings,
): { avatar: string; settings: V5Settings } => {
  const dbSettings: V5Settings = {
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
