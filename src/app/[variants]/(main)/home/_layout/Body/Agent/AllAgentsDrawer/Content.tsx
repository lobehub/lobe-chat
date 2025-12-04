'use client';

import { Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';
import { VList } from 'virtua';

import { SESSION_CHAT_URL } from '@/const/url';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { LobeAgentSession, LobeSessionType, LobeSessions } from '@/types/session';

import Item from '../List/Item';

const shouldHideSession = (session: LobeSessions[0]) =>
  session.type === LobeSessionType.Agent && Boolean((session as LobeAgentSession).config?.virtual);

const filterSessionsForView = (sessions: LobeSessions): LobeSessions => {
  return sessions.filter((session) => !shouldHideSession(session));
};

interface ContentProps {
  open: boolean;
  searchKeyword: string;
}

const Content = memo<ContentProps>(({ searchKeyword }) => {
  const { t } = useTranslation('common');
  const switchSession = useSwitchSession();

  const [useSearchSessions] = useSessionStore((s) => [s.useSearchSessions]);

  // Use server-side search if there's a keyword
  const trimmedKeyword = searchKeyword.trim();
  const isSearching = trimmedKeyword.length > 0;

  // Search sessions or use all default sessions
  const { data: searchResults, isLoading: isSearchLoading } = useSearchSessions(
    isSearching ? trimmedKeyword : undefined,
  );
  const allDefaultSessions = useSessionStore(sessionSelectors.defaultSessions, isEqual);

  // Filter and display
  const displaySessions = useMemo(() => {
    const sessions = isSearching ? searchResults : allDefaultSessions;
    if (!sessions) return [];
    return filterSessionsForView(sessions);
  }, [isSearching, searchResults, allDefaultSessions]);

  const count = displaySessions.length;

  // Show loading skeleton when searching
  if (isSearching && isSearchLoading) {
    return (
      <Flexbox gap={1} paddingBlock={1} paddingInline={4}>
        <SkeletonList rows={5} />
      </Flexbox>
    );
  }

  // Show empty state when no agents
  if (count === 0) {
    return (
      <Center height={'100%'}>
        <Empty
          description={
            isSearching ? t('navPanel.searchResultEmpty') : t('emptyAgentAction', { ns: 'chat' })
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Center>
    );
  }

  return (
    <VList bufferSize={800} style={{ height: '100%' }}>
      {displaySessions.map(({ id, ...res }) => (
        <Flexbox gap={1} key={id} padding={'4px 8px'}>
          <Link
            aria-label={id}
            onClick={(e) => {
              e.preventDefault();
              switchSession((res as any).config?.id);
            }}
            to={SESSION_CHAT_URL((res as any).config?.id, false)}
          >
            <Item id={id} />
          </Link>
        </Flexbox>
      ))}
    </VList>
  );
});

Content.displayName = 'AllAgentsDrawerContent';

export default Content;
