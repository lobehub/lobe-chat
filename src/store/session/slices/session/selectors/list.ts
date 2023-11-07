import { INBOX_SESSION_ID } from '@/const/session';
import { MetaData } from '@/types/meta';
import { LobeAgentSession } from '@/types/session';
import { filterWithKeywords } from '@/utils/filter';

import { SessionStore } from '../../../store';
import { initLobeSession } from '../initialState';

export const currentSession = (s: SessionStore): LobeAgentSession | undefined => {
  if (!s.activeId) return;

  if (s.activeId === INBOX_SESSION_ID) return s.inbox;

  return s.sessions[s.activeId];
};

export const currentSessionSafe = (s: SessionStore): LobeAgentSession => {
  return currentSession(s) || initLobeSession;
};

export const sessionList = (s: SessionStore) => {
  const filterChats = filterWithKeywords(s.sessions, s.searchKeywords, (item) => [
    Object.values(item.chats || {})
      .map((c) => c.content)
      .join(''),
  ]);
  // 先按照 `pinned` 字段进行排序，置顶的会排在前面。然后，根据 `updateAt` 字段进行倒序排序。
  return Object.values(filterChats).sort((a, b) => {
    if (a.pinned && !b.pinned) {
      return -1;
    }
    if (!a.pinned && b.pinned) {
      return 1;
    }
    if (a.updateAt && b.updateAt) {
      return b.updateAt - a.updateAt;
    }
    return 0;
  });
};

export const pinnedSessionList = (s: SessionStore) => sessionList(s).filter((s) => s.pinned);
export const unpinnedSessionList = (s: SessionStore) => sessionList(s).filter((s) => !s.pinned);

export const hasSessionList = (s: SessionStore) => {
  const list = sessionList(s);
  return list?.length > 0;
};
export const hasPinnedSessionList = (s: SessionStore) => {
  const list = pinnedSessionList(s);
  return list?.length > 0;
};

export const getSessionById =
  (id: string) =>
  (s: SessionStore): LobeAgentSession => {
    if (id === INBOX_SESSION_ID) return s.inbox;

    const session = s.sessions[id];

    if (!session) return initLobeSession;
    return session;
  };

export const getSessionMetaById =
  (id: string) =>
  (s: SessionStore): MetaData => {
    const session = getSessionById(id)(s);

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

export const hasConversion = (s: SessionStore) => {
  const hasCustomAgents = !!Object.keys(s.sessions).length;
  const hasMessageInInbox = !!Object.keys(s.inbox.chats).length;

  return hasCustomAgents || hasMessageInInbox;
};
