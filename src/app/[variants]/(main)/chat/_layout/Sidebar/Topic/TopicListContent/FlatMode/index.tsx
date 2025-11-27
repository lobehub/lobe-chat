'use client';

import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

import TopicItem from '../../List/Item';

const FlatMode = memo(() => {
  const [activeTopicId, activeThreadId] = useChatStore((s) => [s.activeTopicId, s.activeThreadId]);
  const activeTopicList = useChatStore(topicSelectors.displayTopics, isEqual);

  return (
    <Flexbox gap={1}>
      {activeTopicList?.map((topic) => (
        <TopicItem
          active={activeTopicId === topic.id}
          fav={topic.favorite}
          id={topic.id}
          key={topic.id}
          threadId={activeThreadId}
          title={topic.title}
        />
      ))}
    </Flexbox>
  );
});

FlatMode.displayName = 'FlatMode';

export default FlatMode;
