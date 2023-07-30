import { LanguageModel } from '@/types/llm';
import type { GlobalSettings } from '@/types/settings';

export type SidebarTabKey = 'chat' | 'market' | 'setting';

export const DEFAULT_SETTINGS: GlobalSettings = {
  OPENAI_API_KEY: '',
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
  password: '',
  presencePenalty: 0,
  primaryColor: '',
  temperature: 0.5,
  themeMode: 'auto',
  topP: 1,
};

export interface SettingsState {
  inputHeight: number;
  sessionExpandable?: boolean;
  sessionsWidth: number;
  settings: GlobalSettings;
  showAgentConfig?: boolean;
  sidebarKey: SidebarTabKey;
}

export const initialState: SettingsState = {
  inputHeight: 200,
  sessionExpandable: true,
  sessionsWidth: 320,
  settings: DEFAULT_SETTINGS,
  showAgentConfig: true,
  sidebarKey: 'chat',
};
