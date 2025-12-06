'use client';

import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';

import { useFetchSessions } from '@/hooks/useFetchSessions';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { LobeAgentSession, LobeSessionType, LobeSessions } from '@/types/session';

const shouldHideSession = (session: LobeSessions[0]) =>
  session.type === LobeSessionType.Agent && Boolean((session as LobeAgentSession).config?.virtual);

const filterSessionsForView = (sessions: LobeSessions): LobeSessions => {
  return sessions.filter((session) => !shouldHideSession(session));
};

export const useAgentList = (limitDefault = true) => {
  useFetchSessions();

  const agentPageSize = useGlobalStore(systemStatusSelectors.agentPageSize);
  const defaultSessions = useSessionStore(
    limitDefault
      ? sessionSelectors.defaultSessionsLimited(agentPageSize)
      : sessionSelectors.defaultSessions,
    isEqual,
  );
  const customSessionGroups = useSessionStore(sessionSelectors.customSessionGroups, isEqual);
  const pinnedSessions = useSessionStore(sessionSelectors.pinnedSessions, isEqual);

  return useMemo(() => {
    const filteredDefaultSessions = filterSessionsForView(defaultSessions);
    const filteredPinnedSessions = filterSessionsForView(pinnedSessions);
    const filteredCustomSessionGroups = customSessionGroups?.map((group) => ({
      ...group,
      children: filterSessionsForView(group.children),
    }));

    return {
      customList: filteredCustomSessionGroups,
      defaultList: filteredDefaultSessions,
      pinnedList: filteredPinnedSessions,
    };
  }, [customSessionGroups, pinnedSessions, defaultSessions]);
};
