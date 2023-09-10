import { AgentsMarketIndexItem, AgentsMarketItem } from '@/types/market';

export interface StroeState {
  agentList: AgentsMarketIndexItem[];
  agentManifest?: AgentsMarketItem;
  agentManifestUrl?: string;
  agentModalOpen: boolean;
  searchKeywords: string;
}

export const initialState: StroeState = {
  agentList: [],
  agentModalOpen: false,
  searchKeywords: '',
};
