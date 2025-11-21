import { FileSearchResult } from '@lobechat/types';
import { Text, Tooltip } from '@lobehub/ui';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';

import { useStyles } from './style';

export interface FileItemProps extends FileSearchResult {
  index: number;
}

const FileItem = memo<FileItemProps>(({ fileId, fileName, relevanceScore, topChunks }) => {
  const { styles, cx } = useStyles();
  const openFilePreview = useChatStore((s) => s.openFilePreview);

  const isMobile = useIsMobile();

  // Use the first chunk for preview
  const firstChunk = topChunks[0];

  return (
    <Flexbox
      align={'center'}
      className={cx(styles.container, isMobile && styles.mobile)}
      gap={4}
      horizontal
      key={fileId}
      onClick={(e) => {
        e.stopPropagation();
        if (firstChunk) {
          openFilePreview({
            chunkId: firstChunk.id,
            chunkText: firstChunk.text,
            fileId,
          });
        }
      }}
    >
      <FileIcon fileName={fileName} size={20} variant={'raw'} />
      <Flexbox gap={12} horizontal justify={'space-between'} style={{ maxWidth: 200 }}>
        <Text ellipsis>{fileName}</Text>
        <Tooltip title={`Relevance: ${(relevanceScore * 100).toFixed(1)}%`}>
          <Center className={styles.badge}>{relevanceScore.toFixed(2)}</Center>
        </Tooltip>
      </Flexbox>
    </Flexbox>
  );
});

export default FileItem;
