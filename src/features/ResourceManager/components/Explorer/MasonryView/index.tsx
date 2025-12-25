'use client';

import { Center } from '@lobehub/ui';
import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { Button } from 'antd';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import { FileListItem } from '@/types/files';

import { useMasonryColumnCount } from '../useMasonryColumnCount';
import MasonryItemWrapper from './MasonryFileItem/MasonryItemWrapper';

interface MasonryViewProps {
  data: FileListItem[] | undefined;
  hasMore: boolean;
  isMasonryReady: boolean;
  loadMore: () => Promise<void>;
  onOpenFile?: (id: string) => void;
  selectFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
}

const MasonryView = memo<MasonryViewProps>(
  ({ data, hasMore, isMasonryReady, loadMore, onOpenFile, selectFileIds, setSelectedFileIds }) => {
    const { t } = useTranslation('file');
    const columnCount = useMasonryColumnCount();
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const libraryId = useResourceManagerStore((s) => s.libraryId);

    const masonryContext = useMemo(
      () => ({
        knowledgeBaseId: libraryId,
        openFile: onOpenFile,
        selectFileIds,
        setSelectedFileIds,
      }),
      [onOpenFile, libraryId, selectFileIds, setSelectedFileIds],
    );

    // Handle load more button click
    const handleLoadMore = useCallback(async () => {
      if (!hasMore || isLoadingMore) return;

      setIsLoadingMore(true);
      try {
        await loadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }, [hasMore, loadMore, isLoadingMore]);

    return (
      <div
        style={{
          flex: 1,
          height: '100%',
          opacity: isMasonryReady ? 1 : 0,
          overflowY: 'auto',
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <div style={{ paddingBlockEnd: 24, paddingBlockStart: 12, paddingInline: 24 }}>
          <VirtuosoMasonry
            ItemContent={MasonryItemWrapper}
            columnCount={columnCount}
            context={masonryContext}
            data={data || []}
            style={{
              gap: '16px',
            }}
          />
          {hasMore && (
            <Center style={{ marginBlockStart: 24 }}>
              <Button loading={isLoadingMore} onClick={handleLoadMore} type="default">
                {t('loadMore', { defaultValue: 'Load More' })}
              </Button>
            </Center>
          )}
        </div>
      </div>
    );
  },
);

export default MasonryView;
