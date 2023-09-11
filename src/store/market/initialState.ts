import { AgentsMarketIndexItem } from '@/types/market';

export interface StroeState {
  agentList: AgentsMarketIndexItem[];
  currentIdentifier: string;
  searchKeywords: string;
  showAgentSidebar: boolean;
}

export const initialState: StroeState = {
  agentList: [],
  currentIdentifier: '',
  searchKeywords: '',
  showAgentSidebar: false,
};
