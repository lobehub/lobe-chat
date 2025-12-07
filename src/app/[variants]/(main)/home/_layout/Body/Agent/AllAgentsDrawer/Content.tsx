'use client';

import { SESSION_CHAT_URL } from '@lobechat/const';
import { Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';
import { VList } from 'virtua';

import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useNavigateToAgent } from '@/hooks/useNavigateToAgent';
import { SidebarAgentItem, homeSelectors, useHomeStore } from '@/store/home';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { LobeAgentSession, LobeSession, LobeSessionType } from '@/types/session';

import Item from '../List/Item';

// Transform LobeSession to SidebarAgentItem for display
const toSidebarAgentItem = (session: LobeSession): SidebarAgentItem => ({
  avatar: sessionMetaSelectors.getAvatar(session.meta),
  description: session.meta.description || null,
  id:
    session.type === LobeSessionType.Agent
      ? ((session as LobeAgentSession).config?.id ?? session.id)
      : session.id,
  pinned: session.pinned ?? false,
  sessionId: session.id,
  title: session.meta.title || null,
  type: session.type === LobeSessionType.Agent ? 'agent' : 'group',
  updatedAt: session.updatedAt,
});

const shouldHideSession = (session: LobeSession) =>
  session.type === LobeSessionType.Agent && Boolean((session as LobeAgentSession).config?.virtual);

interface ContentProps {
  open: boolean;
  searchKeyword: string;
}

const Content = memo<ContentProps>(({ searchKeyword }) => {
  const { t } = useTranslation('common');
  const navigateToAgent = useNavigateToAgent();

  const [useSearchSessions] = useSessionStore((s) => [s.useSearchSessions]);

  // Use server-side search if there's a keyword
  const trimmedKeyword = searchKeyword.trim();
  const isSearching = trimmedKeyword.length > 0;

  // Search sessions
  const { data: searchResults, isLoading: isSearchLoading } = useSearchSessions(
    isSearching ? trimmedKeyword : undefined,
  );

  // Get all agents from homeStore (ungrouped agents for default view)
  const allUngroupedAgents = useHomeStore(homeSelectors.ungroupedAgents, isEqual);

  // Filter and display
  const displayItems = useMemo<SidebarAgentItem[]>(() => {
    if (isSearching) {
      // Convert search results to SidebarAgentItem format
      if (!searchResults) return [];
      return searchResults
        .filter((session: LobeSession) => !shouldHideSession(session))
        .map(toSidebarAgentItem);
    }
    // Use ungrouped agents from homeStore
    return allUngroupedAgents;
  }, [isSearching, searchResults, allUngroupedAgents]);

  const count = displayItems.length;

  // Show loading skeleton when searching
  if (isSearching && (isSearchLoading || !searchResults)) {
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
      {displayItems.map((item) => (
        <Flexbox gap={1} key={item.id} padding={'4px 8px'}>
          <Link
            aria-label={item.id}
            onClick={(e) => {
              e.preventDefault();
              navigateToAgent(item.sessionId || item.id);
            }}
            to={SESSION_CHAT_URL(item.sessionId || item.id, false)}
          >
            <Item item={item} />
          </Link>
        </Flexbox>
      ))}
    </VList>
  );
});

Content.displayName = 'AllAgentsDrawerContent';

export default Content;
