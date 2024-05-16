'use client';

import { EmptyCard } from '@lobehub/ui';
import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import React, { Suspense, memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { imageUrl } from '@/const/url';
import { isServerMode } from '@/const/version';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { ChatTopic } from '@/types/topic';

import { Placeholder, SkeletonList } from './SkeletonList';
import TopicItem from './TopicItem';

const TopicListContent = memo(() => {
  const { t } = useTranslation('chat');
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { isDarkMode } = useThemeMode();
  const [topicsInit, activeTopicId, topicLength, useFetchTopics] = useChatStore((s) => [
    s.topicsInit,
    s.activeTopicId,
    topicSelectors.currentTopicLength(s),
    s.useFetchTopics,
  ]);
  const [visible, updateGuideState] = useUserStore((s) => [
    s.preference.guide?.topic,
    s.updateGuideState,
  ]);

  const topics = useChatStore(
    (s) => [
      {
        favorite: false,
        id: 'default',
        title: t('topic.defaultTitle'),
      } as ChatTopic,
      ...topicSelectors.displayTopics(s),
    ],
    isEqual,
  );

  const [sessionId] = useSessionStore((s) => [s.activeId]);

  const { isLoading } = useFetchTopics(sessionId);

  const itemContent = useCallback(
    (index: number, { id, favorite, title }: ChatTopic) =>
      index === 0 ? (
        <TopicItem active={!activeTopicId} fav={favorite} title={title} />
      ) : (
        <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
      ),
    [activeTopicId],
  );

  const activeIndex = topics.findIndex((topic) => topic.id === activeTopicId);

  // first time loading
  if (!topicsInit) return <SkeletonList />;

  // in server mode and re-loading
  if (isServerMode && isLoading) return <SkeletonList />;

  // in client mode no need the loading state for better UX
  return (
    <>
      {topicLength === 0 && visible && (
        <Flexbox paddingInline={8}>
          <EmptyCard
            alt={t('topic.guide.desc')}
            cover={imageUrl(`empty_topic_${isDarkMode ? 'dark' : 'light'}.webp`)}
            desc={t('topic.guide.desc')}
            height={120}
            imageProps={{
              priority: true,
            }}
            onVisibleChange={(visible) => {
              updateGuideState({ topic: visible });
            }}
            style={{ flex: 'none', marginBottom: 12 }}
            title={t('topic.guide.title')}
            visible={visible}
            width={200}
          />
        </Flexbox>
      )}
      <Virtuoso
        components={{ ScrollSeekPlaceholder: Placeholder }}
        computeItemKey={(_, item) => item.id}
        data={topics}
        fixedItemHeight={44}
        initialTopMostItemIndex={Math.max(activeIndex, 0)}
        itemContent={itemContent}
        overscan={44 * 10}
        ref={virtuosoRef}
        scrollSeekConfiguration={{
          enter: (velocity) => Math.abs(velocity) > 350,
          exit: (velocity) => Math.abs(velocity) < 10,
        }}
      />
    </>
  );
});

TopicListContent.displayName = 'TopicListContent';

export default memo(() => (
  <Suspense fallback={<SkeletonList />}>
    <TopicListContent />
  </Suspense>
));
