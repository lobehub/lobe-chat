'use client';

import { EmptyCard } from '@lobehub/ui';
import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { imageUrl } from '@/const/url';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { TopicDisplayMode } from '@/types/topic';

import { SkeletonList } from '../SkeletonList';
import ByTimeMode from './ByTimeMode';
import FlatMode from './FlatMode';

const TopicListContent = memo(() => {
  const { t } = useTranslation('chat');
  const { isDarkMode } = useThemeMode();
  const [topicsInit, topicLength, useFetchTopics] = useChatStore((s) => [
    s.topicsInit,
    topicSelectors.currentTopicLength(s),
    s.useFetchTopics,
  ]);

  const [visible, updateGuideState, topicDisplayMode] = useUserStore((s) => [
    s.preference.guide?.topic,
    s.updateGuideState,
    preferenceSelectors.topicDisplayMode(s),
  ]);

  const activeTopicList = useChatStore(topicSelectors.displayTopics, isEqual);

  const [sessionId] = useSessionStore((s) => [s.activeId]);

  useFetchTopics(sessionId);

  // first time loading or has no data
  if (!topicsInit || !activeTopicList) return <SkeletonList />;

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
      {topicDisplayMode === TopicDisplayMode.ByTime ? <ByTimeMode /> : <FlatMode />}
    </>
  );
});

TopicListContent.displayName = 'TopicListContent';

export default TopicListContent;
