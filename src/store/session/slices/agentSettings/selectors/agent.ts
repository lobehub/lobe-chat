import { getSafeAgent } from '@/helpers/agent';
import { SessionStore } from '@/store';
import { ChatAgent, ChatAgentWithoutFlow } from '@/types';
import { filterWithKeywords } from '@/utils/filter';

export const agentListSel = (s: SessionStore): ChatAgentWithoutFlow[] => {
  const filterAgents = filterWithKeywords(s.agents, s.keywords, (item) => [item.content]);

  return Object.values(filterAgents).sort((a, b) => (b.updateAt || 0) - (a.updateAt || 0));
};

export const currentAgentSel = (s: SessionStore): ChatAgentWithoutFlow => {
  return getSafeAgent(s.agents, s.activeId);
};

export const currentAgentWithFlowSel = (s: SessionStore): ChatAgent =>
  getSafeAgent(s.agents, s.activeId);

export const currentAgentTitleSel = (s: SessionStore) => {
  return currentAgentSel(s).title || currentAgentSel(s).content.slice(0, 10);
};

export const getAgentById =
  (id: string) =>
  (s: SessionStore): ChatAgentWithoutFlow => {
    return getSafeAgent(s.agents, id);
  };
