import { flatten } from 'lodash-es';

import { DEFAULT_AGENTS_MARKET_ITEM } from '@/const/market';
import { AgentsMarketItem } from '@/types/market';
import { findDuplicates } from '@/utils/findDuplicates';

import type { Store } from './store';

const getAgentList = (s: Store) => s.agentList;
const getAgentTagList = (s: Store) => {
  const agentList = s.agentList;
  const rawAgentTagList = flatten(agentList.map((item) => item.meta.tags)) as string[];
  return findDuplicates(rawAgentTagList);
};

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
