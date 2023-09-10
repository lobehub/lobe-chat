import type { Store } from './store';

const getAgentList = (s: Store) => s.agentList;

const getAgentTagList = (s: Store) => {
  if (s.agentTagList.length > 0) return s.agentTagList;
  return s.generateAgentTagList();
};
export const selectors = {
  getAgentList,
  getAgentTagList,
};
