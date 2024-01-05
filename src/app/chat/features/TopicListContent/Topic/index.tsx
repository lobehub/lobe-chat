import { EmptyCard } from '@lobehub/ui';
import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { ChatTopic } from '@/types/topic';

import SkeletonList from './SkeletonList';
import TopicItem from './TopicItem';

export const Topic = memo(() => {
  const { t } = useTranslation('empty');
  const { isDarkMode } = useThemeMode();
  const [topicsInit, activeTopicId, topicLength] = useChatStore((s) => [
    s.topicsInit,
    s.activeTopicId,
    topicSelectors.currentTopicLength(s),
  ]);
  const [visible, updateGuideState] = useGlobalStore((s) => [
    s.preference.guide?.topic,
    s.updateGuideState,
  ]);

  const topics = useChatStore(
    (s) => [
      {
        favorite: false,
        id: 'default',
        title: t('topic.defaultTitle', { ns: 'chat' }),
      } as ChatTopic,
      ...topicSelectors.displayTopics(s),
    ],
    isEqual,
  );

  const itemContent = useCallback(
    (index: number, { id, favorite, title }: ChatTopic) =>
      index === 0 ? (
        <TopicItem active={!activeTopicId} fav={favorite} title={title} />
      ) : (
        <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
      ),
    [activeTopicId],
  );

  return !topicsInit ? (
    <SkeletonList />
  ) : (
    <Flexbox gap={2} height={'100%'} style={{ marginBottom: 12 }}>
      {topicLength === 0 && (
        <EmptyCard
          alt={t('topic.desc')}
          cover={`/images/empty_topic_${isDarkMode ? 'dark' : 'light'}.webp`}
          desc={t('topic.desc')}
          height={120}
          onVisibleChange={(visible) => {
            updateGuideState({ topic: visible });
          }}
          style={{ marginBottom: 6 }}
          title={t('topic.title')}
          visible={visible}
          width={200}
        />
      )}
      <Virtuoso data={topics} itemContent={itemContent} overscan={12} />
    </Flexbox>
  );
});
