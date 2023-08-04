import { useThemeMode } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import Empty from '@/components/Empty';
import { topicSelectors, useSessionStore } from '@/store/session';

import TopicItem from './TopicItem';

export const Topic = () => {
  const topics = useSessionStore(topicSelectors.currentTopics);
  const { isDarkMode } = useThemeMode();
  const [activeTopicId] = useSessionStore((s) => [s.activeTopicId], shallow);
  const { t } = useTranslation('empty');
  return (
    <Flexbox gap={2}>
      {topics?.length === 0 && (
        <Empty
          cover={`/images/empty_topic_${isDarkMode ? 'dark' : 'light'}.webp`}
          desc={t('topic.desc')}
          title={t('topic.title')}
        />
      )}

      <TopicItem active={!activeTopicId} fav={false} title={'默认话题'} />

      {topics.map(({ id, favorite, title }) => (
        <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
      ))}
    </Flexbox>
  );
};
