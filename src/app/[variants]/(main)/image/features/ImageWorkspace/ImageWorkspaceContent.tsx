'use client';

import { Center, Flexbox } from 'react-layout-kit';

import GenerationFeed from '@/app/[variants]/(main)/image/features/GenerationFeed';
import PromptInput from '@/app/[variants]/(main)/image/features/PromptInput';
import { useImageStore } from '@/store/image';
import { generationBatchSelectors } from '@/store/image/selectors';
import { generationTopicSelectors } from '@/store/image/slices/generationTopic/selectors';

import SkeletonList from './SkeletonList';

const ImageWorkspaceContent = () => {
  const activeTopicId = useImageStore(generationTopicSelectors.activeGenerationTopicId);
  const useFetchGenerationBatches = useImageStore((s) => s.useFetchGenerationBatches);
  const isCurrentGenerationTopicLoaded = useImageStore(
    generationBatchSelectors.isCurrentGenerationTopicLoaded,
  );
  useFetchGenerationBatches(activeTopicId);
  const currentBatches = useImageStore(generationBatchSelectors.currentGenerationBatches);
  const hasGenerations = currentBatches && currentBatches.length > 0;

  if (!isCurrentGenerationTopicLoaded) {
    return <SkeletonList />;
  }

  return (
    <Flexbox
      flex={1}
      height="100%"
      style={{
        overflow: 'hidden',
        padding: 24,
      }}
    >
      {hasGenerations ? (
        <>
          {/* 生成结果展示区 */}
          <Flexbox flex={1} style={{ overflowY: 'auto' }}>
            {/* 切换 topic 时，GenerationFeed 重新渲染，简化 feed 列表滚动逻辑 */}
            <GenerationFeed key={activeTopicId} />
          </Flexbox>

          {/* 底部输入框 */}
          <Center>
            <PromptInput disableAnimation={true} showTitle={false} />
          </Center>
        </>
      ) : (
        // 当没有生成结果时，将输入框完整居中显示
        <Center flex={1}>
          <PromptInput disableAnimation={true} showTitle={true} />
        </Center>
      )}
    </Flexbox>
  );
};

export default ImageWorkspaceContent;
