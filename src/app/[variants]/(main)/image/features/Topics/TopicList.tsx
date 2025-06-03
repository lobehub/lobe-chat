'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFetchGenerationTopics } from '@/hooks/useFetchGenerationTopics';
import { useImageStore } from '@/store/image';
import { generationTopicSelectors } from '@/store/image/selectors';

import AddButton from './NewTopicButton';
import TopicItem from './TopicItem';

const TopicsList = memo(() => {
  useFetchGenerationTopics();

  const generationTopics = useImageStore(generationTopicSelectors.generationTopics);
  const isEmpty = !generationTopics || generationTopics.length === 0;

  // 如果没有数据且不在加载状态，不渲染组件
  if (isEmpty) {
    return null;
  }

  return (
    <Flexbox
      align="center" // 水平居中
      gap={8}
      padding={12}
      style={{
        height: '100%',
        overflowY: 'auto',
        width: 60, // 缩略图列表宽度
      }}
    >
      <AddButton />

      <Flexbox align="center" gap={6}>
        {generationTopics.map((topic) => (
          <div key={topic.id}>
            <TopicItem topic={topic} />
          </div>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

TopicsList.displayName = 'TopicsList';

export default TopicsList;
