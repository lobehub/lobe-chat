'use client';

import { Text } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import React, { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { ChatTopic } from '@/types/topic';

import { SkeletonList } from '../../SkeletonList';
import TopicItem from '../TopicItem';

const SearchResult = memo(() => {
  const { t } = useTranslation('topic');
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [activeTopicId, isSearchingTopic] = useChatStore((s) => [
    s.activeTopicId,
    topicSelectors.isSearchingTopic(s),
  ]);
  const topics = useChatStore(topicSelectors.searchTopics, isEqual);

  const itemContent = useCallback(
    (index: number, { id, favorite, title }: ChatTopic) => (
      <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
    ),
    [activeTopicId],
  );

  const activeIndex = topics.findIndex((topic) => topic.id === activeTopicId);

  if (isSearchingTopic) return <SkeletonList />;

  if (topics.length === 0)
    return (
      <Center paddingBlock={12}>
        <Text type={'secondary'}>{t('searchResultEmpty')}</Text>
      </Center>
    );

  return (
    <Virtuoso
      computeItemKey={(_, item) => item.id}
      data={topics}
      defaultItemHeight={44}
      initialTopMostItemIndex={Math.max(activeIndex, 0)}
      itemContent={itemContent}
      overscan={44 * 10}
      ref={virtuosoRef}
    />
  );
});

SearchResult.displayName = 'SearchResult';

export default SearchResult;
