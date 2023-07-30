import { SessionStore } from '@/store/session';
import { MetaData } from '@/types/meta';
import { LobeAgentSession } from '@/types/session';
import { filterWithKeywords } from '@/utils/filter';

import { initLobeSession } from '../initialState';

export const currentSession = (s: SessionStore): LobeAgentSession | undefined => {
  if (!s.activeId) return;

  return s.sessions[s.activeId];
};

export const currentSessionSafe = (s: SessionStore): LobeAgentSession => {
  return currentSession(s) || initLobeSession;
};

export const sessionList = (s: SessionStore) => {
  const filterChats = filterWithKeywords(s.sessions, s.searchKeywords, (item) => [
    Object.values(item.chats)
      .map((c) => c.content)
      .join(''),
  ]);

  return Object.values(filterChats).sort((a, b) => (b.updateAt || 0) - (a.updateAt || 0));
};

export const getSessionById =
  (id: string) =>
  (s: SessionStore): LobeAgentSession => {
    const session = s.sessions[id];

    if (!session) return initLobeSession;
    return session;
  };

export const getSessionMetaById =
  (id: string) =>
  (s: SessionStore): MetaData => {
    const session = s.sessions[id];

    if (!session) return {};
    return session.meta;
  };

// export const sessionTreeSel = (s: SessionStore) => {
//   const sessionTree: SessionTree = [
//     {
//       agentId: 'default',
//       chats: chatListSel(s)
//         .filter((s) => !s.agentId)
//         .map((c) => c.id),
//     },
//   ];
//
//   Object.values(s.agents).forEach((agent) => {
//     const chats = Object.values(s.chats).filter((s) => s.agentId === agent.id);
//
//     sessionTree.push({
//       agentId: agent.id,
//       chats: chats.map((c) => c.id),
//     });
//   });
//
//   return sessionTree;
// };
