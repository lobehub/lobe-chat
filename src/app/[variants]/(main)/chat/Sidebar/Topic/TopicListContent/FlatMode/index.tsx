'use client';

import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

import TopicItem from '../../List/Item';

const FlatMode = memo(() => {
  const { t } = useTranslation('topic');
  const [activeTopicId] = useChatStore((s) => [s.activeTopicId]);
  const activeTopicList = useChatStore(topicSelectors.displayTopics, isEqual);

  return (
    <Flexbox gap={1}>
      {/* Default topic */}
      <TopicItem active={!activeTopicId} fav={false} key="default" title={t('defaultTitle')} />

      {/* Regular topics */}
      {activeTopicList?.map((topic) => (
        <TopicItem
          active={activeTopicId === topic.id}
          fav={topic.favorite}
          id={topic.id}
          key={topic.id}
          title={topic.title}
        />
      ))}
    </Flexbox>
  );
});

FlatMode.displayName = 'FlatMode';

export default FlatMode;
