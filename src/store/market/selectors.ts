import { DEFAULT_AGENTS_MARKET_ITEM } from '@/const/market';
import { AgentsMarketItem } from '@/types/market';

import type { Store } from './store';

const getAgentList = (s: Store) => {
  const { searchKeywords, agentList } = s;
  if (!searchKeywords) return agentList;
  return agentList.filter(({ meta }) => {
    const checkMeta: string = [meta.tags, meta.title, meta.description, meta.avatar]
      .filter(Boolean)
      .join('');
    return checkMeta.toLowerCase().includes(searchKeywords.toLowerCase());
  });
};
const getAgentTagList = (s: Store) => s.tagList;

const getAgentItemById = (d: string) => (s: Store) => s.agentMap[d];

const currentAgentItem = (s: Store) => getAgentItemById(s.currentIdentifier)(s);

const currentAgentItemSafe = (s: Store): AgentsMarketItem => {
  const item = getAgentItemById(s.currentIdentifier)(s);
  if (!item) return DEFAULT_AGENTS_MARKET_ITEM;

  return item;
};

const showSideBar = (s: Store) => !!s.currentIdentifier;

export const agentMarketSelectors = {
  currentAgentItem,
  currentAgentItemSafe,
  getAgentItemById,
  getAgentList,
  getAgentTagList,
  showSideBar,
};
