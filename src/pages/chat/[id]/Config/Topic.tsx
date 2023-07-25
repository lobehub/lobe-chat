import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { topicSelectors, useSessionStore } from '@/store/session';

import TopicItem from './TopicItem';

export const Topic = () => {
  const topics = useSessionStore(topicSelectors.currentTopics);
  const [activeTopicId] = useSessionStore((s) => [s.activeTopicId], shallow);
  return (
    <Flexbox gap={8}>
      <TopicItem active={!activeTopicId} fav={false} title={'默认话题'} />

      {topics.map(({ id, favorite, title }) => (
        <TopicItem
          active={activeTopicId === id}
          fav={favorite}
          id={id}
          key={id}
          showFav
          title={title}
        />
      ))}
    </Flexbox>
  );
};
