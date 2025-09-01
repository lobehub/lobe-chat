import { FewShots } from '@lobechat/types';
import { LLMParams } from 'model-bank';

export type TTSServer = 'openai' | 'edge' | 'microsoft';

export interface TTSConfig {
  showAllLocaleVoice?: boolean;
  sttLocale: 'auto' | string;
  ttsService: TTSServer;
  voice: {
    edge?: string;
    microsoft?: string;
    openai: string;
  };
}

export interface ChatConfig {
  autoCreateTopicThreshold: number;
  compressThreshold?: number;
  displayMode?: 'chat' | 'docs';
  enableAutoCreateTopic?: boolean;
  enableCompressThreshold?: boolean;
  enableHistoryCount?: boolean;
  enableMaxTokens?: boolean;
  historyCount?: number;
  inputTemplate?: string;
}

export interface V6AgentConfig {
  chatConfig: ChatConfig;
  fewShots?: FewShots;
  model: string;
  openingMessage?: string;
  openingQuestions?: string[];
  params: LLMParams;
  plugins?: string[];
  provider?: string;
  systemRole: string;
  tts: TTSConfig;
}

export interface V6Session {
  config: V6AgentConfig;
  createdAt: number;

  group?: string;
  id: string;
  meta: {
    avatar?: string;
    backgroundColor?: string;
    description?: string;
    tags?: string[];
    title?: string;
  };
  model: string;
  pinned?: boolean;
  type: 'agent';
  updatedAt: number;
}

export interface V6ConfigState {
  sessions: V6Session[];
}
