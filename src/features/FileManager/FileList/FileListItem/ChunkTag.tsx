import { memo } from 'react';

import FileParsingStatusTag from '@/components/FileParsingStatus';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { FileParsingTask } from '@/types/asyncTask';

interface ChunkTagProps extends FileParsingTask {
  id: string;
}

const ChunksBadge = memo<ChunkTagProps>(({ id, ...res }) => {
  const [isCreatingChunkEmbeddingTask, embeddingChunks, reParseFile, openChunkDrawer] =
    useFileStore((s) => [
      fileManagerSelectors.isCreatingChunkEmbeddingTask(id)(s),
      s.embeddingChunks,
      s.reParseFile,
      s.openChunkDrawer,
    ]);

  return (
    <FileParsingStatusTag
      onClick={(status) => {
        if (status === 'success') openChunkDrawer(id);
      }}
      onEmbeddingClick={() => embeddingChunks([id])}
      onErrorClick={(task) => {
        if (task === 'chunking') reParseFile(id);
      }}
      preparingEmbedding={isCreatingChunkEmbeddingTask}
      {...res}
    />
  );
});

export default ChunksBadge;
