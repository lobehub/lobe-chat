import { AgentsMarketIndexItem } from '@/types/market';

export interface StroeState {
  agentList: AgentsMarketIndexItem[];
  agentManifestUrl?: string;
  searchKeywords: string;
  showAgentSidebar: boolean;
}

export const initialState: StroeState = {
  agentList: [],
  searchKeywords: '',
  showAgentSidebar: false,
};
