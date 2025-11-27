'use client';

import { AccordionItem, Dropdown, Text } from '@lobehub/ui';
import React, { Suspense, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { SkeletonList } from '../SkeletonList';
import Actions from './Actions';
import List from './List';
import { useTopicActionsDropdownMenu } from './useDropdownMenu';

interface TopicProps {
  itemKey: string;
}

const Topic = memo<TopicProps>(({ itemKey }) => {
  const { t } = useTranslation(['topic', 'common']);
  const [topicLength] = useChatStore((s) => [topicSelectors.currentTopicLength(s)]);
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownMenu = useTopicActionsDropdownMenu();

  if (isInbox) return null;

  return (
    <AccordionItem
      action={
        <Actions
          onClear={() => setShowSearch(false)}
          onSearch={() => setShowSearch(true)}
          showSearch={showSearch}
        />
      }
      headerWrapper={(header) => (
        <Dropdown
          menu={{
            items: dropdownMenu,
          }}
          trigger={['contextMenu']}
        >
          {header}
        </Dropdown>
      )}
      itemKey={itemKey}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
          {`${t('title')} ${topicLength > 1 ? topicLength + 1 : ''}`}
        </Text>
      }
    >
      <Suspense fallback={<SkeletonList />}>
        <Flexbox gap={1} paddingBlock={1}>
          <List showSearch={showSearch} />
        </Flexbox>
      </Suspense>
    </AccordionItem>
  );
});

export default Topic;
