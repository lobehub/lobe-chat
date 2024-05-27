import { LobeAgentTTSConfig } from '@/types/agent';
import { FewShots, LLMParams } from '@/types/llm';

/**
 * Lobe Agent
 */
export interface V5Session {
  config: V5AgentConfig;
  createAt?: number;
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
  updateAt?: number;
  updatedAt: number;
}

export interface V5AgentConfig {
  autoCreateTopicThreshold: number;
  compressThreshold?: number;
  displayMode?: 'chat' | 'docs';
  enableAutoCreateTopic: boolean;
  enableCompressThreshold?: boolean;
  enableHistoryCount?: boolean;
  enableMaxTokens?: boolean;
  fewShots?: FewShots;
  historyCount?: number;
  inputTemplate?: string;
  model: string;
  params: LLMParams;
  plugins?: string[];
  provider?: string;
  systemRole: string;
  tts: LobeAgentTTSConfig;
}

export interface V5ConfigState {
  sessions: V5Session[];
}
