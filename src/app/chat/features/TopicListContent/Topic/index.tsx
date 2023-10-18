import { EmptyCard } from '@lobehub/ui';
import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { useSessionChatInit, useSessionStore } from '@/store/session';
import { topicSelectors } from '@/store/session/selectors';

import SkeletonList from './SkeletonList';
import TopicItem from './TopicItem';

export const Topic = () => {
  const init = useSessionChatInit();
  const topics = useSessionStore(topicSelectors.currentTopics, isEqual);
  const { isDarkMode } = useThemeMode();
  const [activeTopicId, keywords] = useSessionStore((s) => [
    s.activeTopicId,
    s.topicSearchKeywords,
  ]);
  const { t } = useTranslation('empty');
  const [visible, updateGuideState] = useGlobalStore((s) => [
    s.preference.guide?.topic,
    s.updateGuideState,
  ]);

  const topicsData = useMemo(() => {
    if (!keywords) return topics;
    return topics.filter(({ title }) => title.toLowerCase().includes(keywords.toLowerCase()));
  }, [topics, keywords]);

  return !init ? (
    <SkeletonList />
  ) : (
    <Flexbox gap={2} style={{ marginBottom: 12 }}>
      {topics?.length === 0 && (
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

      <TopicItem
        active={!activeTopicId}
        fav={false}
        title={t('topic.defaultTitle', { ns: 'chat' })}
      />

      {topicsData.map(({ id, favorite, title }) => (
        <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
      ))}
    </Flexbox>
  );
};
