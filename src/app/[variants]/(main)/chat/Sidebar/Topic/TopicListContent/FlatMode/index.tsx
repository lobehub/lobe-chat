'use client';

import isEqual from 'fast-deep-equal';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { ChatTopic } from '@/types/topic';

import TopicItem from '../../List/Item';

const FlatMode = memo(() => {
  const { t } = useTranslation('topic');
  const [activeTopicId] = useChatStore((s) => [s.activeTopicId]);
  const activeTopicList = useChatStore(topicSelectors.displayTopics, isEqual);

  const topics = useMemo(
    () => [
      { favorite: false, id: 'default', title: t('defaultTitle') } as ChatTopic,
      ...(activeTopicList || []),
    ],
    [activeTopicList, t],
  );

  return (
    <>
      {topics.map((topic, index) =>
        index === 0 ? (
          <TopicItem
            active={!activeTopicId}
            fav={topic.favorite}
            key="default"
            title={topic.title}
          />
        ) : (
          <TopicItem
            active={activeTopicId === topic.id}
            fav={topic.favorite}
            id={topic.id}
            key={topic.id}
            title={topic.title}
          />
        ),
      )}
    </>
  );
});

FlatMode.displayName = 'FlatMode';

export default FlatMode;
