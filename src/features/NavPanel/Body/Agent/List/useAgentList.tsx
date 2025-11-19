'use client';

import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFetchSessions } from '@/hooks/useFetchSessions';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { LobeAgentSession, LobeSessionType, LobeSessions } from '@/types/session';

const shouldHideSession = (session: LobeSessions[0]) =>
  session.type === LobeSessionType.Agent && Boolean((session as LobeAgentSession).config?.virtual);

const filterSessionsForView = (sessions: LobeSessions): LobeSessions => {
  return sessions.filter((session) => !shouldHideSession(session));
};

export const useAgentList = () => {
  const { t } = useTranslation('chat');

  useFetchSessions();

  const defaultSessions = useSessionStore(sessionSelectors.defaultSessions, isEqual);
  const customSessionGroups = useSessionStore(sessionSelectors.customSessionGroups, isEqual);
  const pinnedSessions = useSessionStore(sessionSelectors.pinnedSessions, isEqual);

  const filteredDefaultSessions = filterSessionsForView(defaultSessions);
  const filteredPinnedSessions = filterSessionsForView(pinnedSessions);
  const filteredCustomSessionGroups = customSessionGroups?.map((group) => ({
    ...group,
    children: filterSessionsForView(group.children),
  }));

  return useMemo(
    () => ({
      customList: filteredCustomSessionGroups,
      defaultList: filteredDefaultSessions,
      pinnedList: filteredPinnedSessions,
    }),
    [t, filteredCustomSessionGroups, filteredPinnedSessions, filteredDefaultSessions],
  );
};
