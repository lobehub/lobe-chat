import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Empty from '@/components/Empty';
import { useGlobalStore } from '@/store/global';
import { topicSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import SkeletonList from './SkeletonList';
import TopicItem from './TopicItem';

export const Topic = () => {
  const hydrated = useSessionHydrated();
  const topics = useSessionStore(topicSelectors.currentTopics, isEqual);
  const { isDarkMode } = useThemeMode();
  const [activeTopicId] = useSessionStore((s) => [s.activeTopicId]);
  const { t } = useTranslation('empty');

  const [visible, updateGuideState] = useGlobalStore((s) => [
    s.preference.guide?.topic,
    s.updateGuideState,
  ]);

  return !hydrated ? (
    <SkeletonList />
  ) : (
    <Flexbox gap={2} style={{ marginBottom: 12 }}>
      {topics?.length === 0 && (
        <Empty
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

      <TopicItem active={!activeTopicId} fav={false} title={'默认话题'} />

      {topics.map(({ id, favorite, title }) => (
        <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
      ))}
    </Flexbox>
  );
};
