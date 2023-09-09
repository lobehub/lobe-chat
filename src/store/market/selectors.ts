import type { Store } from './store';

const getAgentList = (s: Store) => s.agentList;

export const selectors = {
  getAgentList,
};
