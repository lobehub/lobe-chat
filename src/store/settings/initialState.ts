import type { ConfigSettings } from '@/types/exportConfig';
import { LanguageModel } from '@/types/llm';

export type SidebarTabKey = 'chat' | 'market';

export const DEFAULT_SETTINGS: ConfigSettings = {
  accessCode: '',
  avatar: '',
  compressThreshold: 24,
  enableCompressThreshold: false,
  enableHistoryCount: false,
  enableMaxTokens: true,
  endpoint: '',
  fontSize: 14,
  frequencyPenalty: 0,
  historyCount: 24,
  language: 'zh-CN',
  maxTokens: 2000,
  model: LanguageModel.GPT3_5,
  neutralColor: '',
  presencePenalty: 0,
  primaryColor: '',
  temperature: 0.5,
  themeMode: 'auto',
  token: '',
  topP: 1,
};

export interface GlobalSettingsState {
  inputHeight: number;
  sessionExpandable?: boolean;
  sessionsWidth: number;
  settings: ConfigSettings;
  sidebarKey: SidebarTabKey;
}

export const initialState: GlobalSettingsState = {
  inputHeight: 200,
  sessionExpandable: true,
  sessionsWidth: 320,
  settings: DEFAULT_SETTINGS,
  sidebarKey: 'chat',
};
