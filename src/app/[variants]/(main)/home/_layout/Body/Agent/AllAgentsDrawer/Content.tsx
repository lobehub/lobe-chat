'use client';

import { SESSION_CHAT_URL } from '@lobechat/const';
import { Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';
import { VList } from 'virtua';

import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useNavigateToAgent } from '@/hooks/useNavigateToAgent';
import { homeSelectors, useHomeStore } from '@/store/home';

import Item from '../List/Item';

interface ContentProps {
  open: boolean;
  searchKeyword: string;
}

const Content = memo<ContentProps>(({ searchKeyword }) => {
  const { t } = useTranslation('common');
  const navigateToAgent = useNavigateToAgent();

  // Use server-side search if there's a keyword
  const trimmedKeyword = searchKeyword.trim();
  const isSearching = trimmedKeyword.length > 0;

  // Search agents using homeStore
  const [useSearchAgents] = useHomeStore((s) => [s.useSearchAgents]);
  const { data: searchResults, isLoading: isSearchLoading } = useSearchAgents(
    isSearching ? trimmedKeyword : undefined,
  );

  // Get all agents from homeStore (ungrouped agents for default view)
  const allUngroupedAgents = useHomeStore(homeSelectors.ungroupedAgents, isEqual);

  // Filter and display - searchResults already returns SidebarAgentItem[]
  const displayItems = isSearching ? searchResults || [] : allUngroupedAgents;

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
