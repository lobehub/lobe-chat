import { AgentsMarketIndexItem, AgentsMarketItem } from '@/types/market';

export type MarketAgentMap = Record<string, AgentsMarketItem>;

export interface StoreState {
  agentList: AgentsMarketIndexItem[];
  agentMap: MarketAgentMap;
  currentIdentifier: string;
  currentMarketId: number;
  searchKeywords: string;
  tagList: string[];
}

export const initialState: StoreState = {
  agentList: [],
  agentMap: {},
  currentIdentifier: '',
  currentMarketId: 0,
  searchKeywords: '',
  tagList: [],
};
