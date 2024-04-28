import { EmptyCard } from '@lobehub/ui';
import { css, cx, useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import React, { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { imageUrl } from '@/const/url';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { ChatTopic } from '@/types/topic';

import { Placeholder, SkeletonList } from './SkeletonList';
import TopicItem from './TopicItem';

const container = css`
  > div {
    padding-inline: 8px;
  }
`;

export const Topic = memo(() => {
  const { t } = useTranslation('chat');
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { isDarkMode } = useThemeMode();
  const [topicsInit, activeTopicId, topicLength] = useChatStore((s) => [
    s.topicsInit,
    s.activeTopicId,
    topicSelectors.currentTopicLength(s),
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

  return !topicsInit ? (
    <SkeletonList />
  ) : (
    <Flexbox gap={2} height={'100%'} style={{ marginBottom: 12 }}>
      {topicLength === 0 && (
        <Flexbox flex={1} paddingInline={8}>
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
            style={{ marginBottom: 6 }}
            title={t('topic.guide.title')}
            visible={visible}
            width={200}
          />
        </Flexbox>
      )}
      <Virtuoso
        className={cx(container)}
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
    </Flexbox>
  );
});
