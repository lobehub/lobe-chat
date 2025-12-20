'use client';

import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { memo, useCallback, useMemo, useRef } from 'react';

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
    const columnCount = useMasonryColumnCount();
    const isLoadingMore = useRef(false);

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

    // Handle end reached to load more items
    const handleEndReached = useCallback(() => {
      if (!hasMore || isLoadingMore.current) return;

      isLoadingMore.current = true;
      loadMore().finally(() => {
        isLoadingMore.current = false;
      });
    }, [hasMore, loadMore]);

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
        <div
          onScroll={(e) => {
            const target = e.currentTarget;
            const scrollHeight = target.scrollHeight;
            const scrollTop = target.scrollTop;
            const clientHeight = target.clientHeight;

            // Trigger load more when within 200px of the bottom
            if (scrollHeight - scrollTop - clientHeight <= 200) {
              handleEndReached();
            }
          }}
          style={{ paddingBlockEnd: 64, paddingBlockStart: 12, paddingInline: 24 }}
        >
          <VirtuosoMasonry
            ItemContent={MasonryItemWrapper}
            columnCount={columnCount}
            context={masonryContext}
            data={data || []}
            style={{
              gap: '16px',
            }}
          />
        </div>
      </div>
    );
  },
);

export default MasonryView;
