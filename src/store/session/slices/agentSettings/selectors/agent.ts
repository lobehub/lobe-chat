import { getSafeAgent } from '@/helpers/agent';
import { SessionStore } from '@/store/session';
import { LobeAgentSession } from '@/types/session';
import { filterWithKeywords } from '@/utils/filter';

export const agentListSel = (s: SessionStore): LobeAgentSession[] => {
  const filterAgents = filterWithKeywords(s.sessions, s.searchKeywords, (item) =>
    item.chats.map((c) => c.content).filter(Boolean),
  );

  return Object.values(filterAgents).sort((a, b) => (b.updateAt || 0) - (a.updateAt || 0));
};

export const currentAgentSel = (s: SessionStore): LobeAgentSession => {
  return getSafeAgent(s.sessions, s.activeId);
};

export const currentAgentTitleSel = (s: SessionStore) => currentAgentSel(s).meta.title;

export const getAgentById =
  (id: string) =>
  (s: SessionStore): LobeAgentSession => {
    return getSafeAgent(s.sessions, id);
  };
