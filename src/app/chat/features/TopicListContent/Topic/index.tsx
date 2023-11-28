import { EmptyCard } from '@lobehub/ui';
import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';

import SkeletonList from './SkeletonList';
import TopicItem from './TopicItem';

export const Topic = () => {
  const { isDarkMode } = useThemeMode();

  const topics = useChatStore(topicSelectors.displayTopics, isEqual);

  const [topicsInit, activeTopicId] = useChatStore((s) => [s.topicsInit, s.activeTopicId]);

  const { t } = useTranslation('empty');
  const [visible, updateGuideState] = useGlobalStore((s) => [
    s.preference.guide?.topic,
    s.updateGuideState,
  ]);

  return !topicsInit ? (
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

      {topics.map(({ id, favorite, title }) => (
        <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
      ))}
    </Flexbox>
  );
};
