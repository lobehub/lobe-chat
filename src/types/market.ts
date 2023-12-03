import { MetaData } from '@/types/meta';
import { LobeAgentSettings } from '@/types/session';

export interface AgentsMarketIndexItem {
  author: string;
  createAt: string;
  homepage: string;
  identifier: string;
  manifest: string;
  meta: MetaData;
  schemaVersion: 1;
}

export type AgentsMarketItem = AgentsMarketIndexItem & LobeAgentSettings;

export interface LobeChatAgentsMarketIndex {
  agents: AgentsMarketIndexItem[];
  schemaVersion: 1;
  tags: string[];
}
