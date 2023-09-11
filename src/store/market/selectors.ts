import { flatten } from 'lodash-es';

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

const showSideBar = (s: Store) => !!s.currentIdentifier;

export const agentMarketSelectors = {
  currentAgentItem,
  getAgentItemById,
  getAgentList,
  getAgentTagList,
  showSideBar,
};
