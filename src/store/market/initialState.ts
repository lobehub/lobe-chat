import { AgentsMarketIndexItem } from '@/types/market';

export interface StroeState {
  agentList: AgentsMarketIndexItem[];
  agentTagList: string[];
  searchKeywords: string;
}

export const initialState: StroeState = {
  agentList: [],
  agentTagList: [],
  searchKeywords: '',
};
