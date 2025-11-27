'use client';

import { Text } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

import { SkeletonList } from '../../../SkeletonList';
import TopicItem from '../../List/Item';

const SearchResult = memo(() => {
  const { t } = useTranslation('topic');
  const [activeTopicId, isSearchingTopic] = useChatStore((s) => [
    s.activeTopicId,
    topicSelectors.isSearchingTopic(s),
  ]);
  const topics = useChatStore(topicSelectors.searchTopics, isEqual);

  if (isSearchingTopic) return <SkeletonList />;

  if (topics.length === 0)
    return (
      <Center paddingBlock={12}>
        <Text type={'secondary'}>{t('searchResultEmpty')}</Text>
      </Center>
    );

  return (
    <>
      {topics.map((topic) => (
        <TopicItem
          active={activeTopicId === topic.id}
          fav={topic.favorite}
          id={topic.id}
          key={topic.id}
          title={topic.title}
        />
      ))}
    </>
  );
});

SearchResult.displayName = 'SearchResult';

export default SearchResult;
