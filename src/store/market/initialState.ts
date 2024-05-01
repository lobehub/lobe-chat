import { AgentsMarketIndexItem, AgentsMarketItem } from '@/types/market';

export type MarketAgentMap = Record<string, AgentsMarketItem>;

export interface StoreState {
  agentList: AgentsMarketIndexItem[];
  agentMap: MarketAgentMap;
  currentIdentifier: string;
  searchKeywords: string;
  tagList: string[];
}

export const initialState: StoreState = {
  agentList: [],
  agentMap: {},
  currentIdentifier: '',
  searchKeywords: '',
  tagList: [],
};
