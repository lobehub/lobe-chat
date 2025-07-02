'use client';

import { Center } from 'react-layout-kit';

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

  return hasGenerations ? (
    <>
      {/* 生成结果展示区 */}
      <GenerationFeed key={activeTopicId} />
      <div
        style={{
          flex: 1,
          minHeight: 100,
        }}
      />

      {/* 底部输入框 */}
      <Center
        style={{
          position: 'sticky',
          bottom: 16,
          width: '100%',
        }}
      >
        <PromptInput disableAnimation={true} showTitle={false} />
      </Center>
    </>
  ) : (
    // 当没有生成结果时，将输入框完整居中显示
    <Center>
      <PromptInput disableAnimation={true} showTitle={true} />
    </Center>
  );
};

export default ImageWorkspaceContent;
