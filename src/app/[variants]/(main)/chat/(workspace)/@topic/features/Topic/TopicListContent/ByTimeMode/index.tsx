'use client';

import isEqual from 'fast-deep-equal';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupedVirtuoso, VirtuosoHandle } from 'react-virtuoso';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { ChatTopic } from '@/types/topic';

import TopicItem from '../TopicItem';
import TopicGroupItem from './GroupItem';

const ByTimeMode = memo(() => {
  const { t } = useTranslation('topic');
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [activeTopicId, activeThreadId] = useChatStore((s) => [s.activeTopicId, s.activeThreadId]);
  const groupTopics = useChatStore(topicSelectors.groupedTopicsSelector, isEqual);

  const { groups, groupCounts, topics } = useMemo(() => {
    return {
      groupCounts: [1, ...groupTopics.map((group) => group.children.length)],
      groups: [
        { id: 'default' },
        ...groupTopics.map((group) => ({ id: group.id, title: group.title })),
      ],
      topics: [
        { favorite: false, id: 'default', title: t('defaultTitle') } as ChatTopic,
        ...groupTopics.flatMap((group) => group.children),
      ],
    };
  }, [groupTopics]);

  const itemContent = useCallback(
    (index: number) => {
      const { id, favorite, title } = topics[index];

      return index === 0 ? (
        <TopicItem active={!activeTopicId} fav={favorite} title={title} />
      ) : (
        <TopicItem
          active={activeTopicId === id}
          fav={favorite}
          id={id}
          key={id}
          threadId={activeThreadId}
          title={title}
        />
      );
    },
    [activeTopicId, topics, activeThreadId],
  );

  const groupContent = useCallback(
    (index: number) => {
      if (index === 0) return <div style={{ height: 1 }} />;
      const topicGroup = groups[index];
      return <TopicGroupItem {...topicGroup} />;
    },
    [groups],
  );

  return (
    <GroupedVirtuoso
      groupContent={groupContent}
      groupCounts={groupCounts}
      itemContent={itemContent}
      ref={virtuosoRef}
      style={{
        minHeight: groupCounts.length === 1 ? '0px' : '200px',
      }}
    />
  );
});

ByTimeMode.displayName = 'ByTimeMode';

export default ByTimeMode;
