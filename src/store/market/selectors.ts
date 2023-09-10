import type { Store } from './store';

const getAgentList = (s: Store) => s.agentList;
const getAgentManifest = (s: Store) => s.agentManifest;
const getAgentTagList = (s: Store) => s.generateAgentTagList();

export const selectors = {
  getAgentList,
  getAgentManifest,
  getAgentTagList,
};
