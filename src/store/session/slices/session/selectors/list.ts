import { SessionStore } from '@/store/session';
import { LobeAgentSession } from '@/types/session';

import { filterWithKeywords } from '@/utils/filter';

export const currentSessionSel = (s: SessionStore): LobeAgentSession | undefined => {
  if (!s.activeId) return;

  return s.sessions[s.activeId];
};

export const chatListSel = (s: SessionStore) => {
  const filterChats = filterWithKeywords(s.sessions, s.searchKeywords, (item) => [
    item.messages.join(''),
  ]);

  return Object.values(filterChats).sort((a, b) => (b.updateAt || 0) - (a.updateAt || 0));
};

export const sessionTreeSel = (s: SessionStore) => {
  const sessionTree: SessionTree = [
    {
      agentId: 'default',
      chats: chatListSel(s)
        .filter((s) => !s.agentId)
        .map((c) => c.id),
    },
  ];

  Object.values(s.agents).forEach((agent) => {
    const chats = Object.values(s.chats).filter((s) => s.agentId === agent.id);

    sessionTree.push({
      agentId: agent.id,
      chats: chats.map((c) => c.id),
    });
  });

  return sessionTree;
};
