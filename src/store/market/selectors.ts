import type { Store } from './store';

const getAgentList = (s: Store) => s.agentList;

const getAgentTagList = (s: Store) => s.generateAgentTagList();
export const selectors = {
  getAgentList,
  getAgentTagList,
};
