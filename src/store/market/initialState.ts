import { AgentsMarketIndexItem } from '@/types/market';

export interface StroeState {
  agentList: AgentsMarketIndexItem[];
  searchKeywords: string;
}

export const initialState: StroeState = {
  agentList: [],
  searchKeywords: '',
};
