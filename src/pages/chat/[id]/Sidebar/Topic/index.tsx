import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import Empty from '@/components/Empty';
import { topicSelectors, useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import TopicItem from './TopicItem';

export const Topic = () => {
  const topics = useSessionStore(topicSelectors.currentTopics, isEqual);
  const { isDarkMode } = useThemeMode();
  const [activeTopicId] = useSessionStore((s) => [s.activeTopicId], shallow);
  const { t } = useTranslation('empty');

  const [visible, updateGuideState] = useSettings((s) => [s.guide?.topic, s.updateGuideState]);

  return (
    <Flexbox gap={2}>
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
