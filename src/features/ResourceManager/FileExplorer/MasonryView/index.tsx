'use client';

import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Center } from 'react-layout-kit';

import { FileListItem } from '@/types/files';

import MasonryItemWrapper from '../MasonryFileItem/MasonryItemWrapper';
import Skeleton from './Skeleton';

const useStyles = createStyles(({ css, token }) => ({
  loadingMore: css`
    padding: 16px;
    color: ${token.colorTextSecondary};
  `,
}));

interface MasonryViewProps {
  data: FileListItem[] | undefined;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isMasonryReady: boolean;
  isTransitioning: boolean;
  knowledgeBaseId?: string;
  loadMore?: () => void;
  onOpenFile?: (id: string) => void;
  selectFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
}

const MasonryView = memo<MasonryViewProps>(
  ({
    data,
    hasMore,
    isMasonryReady,
    isLoadingMore,
    isTransitioning,
    knowledgeBaseId,
    loadMore,
    onOpenFile,
    selectFileIds,
    setSelectedFileIds,
  }) => {
    const { styles } = useStyles();
    const [columnCount, setColumnCount] = useState(4);

    // Update column count based on window size
    useEffect(() => {
      const updateColumnCount = () => {
        const width = window.innerWidth;
        if (width < 768) {
          setColumnCount(2);
        } else if (width < 1024) {
          setColumnCount(3);
        } else if (width < 1536) {
          setColumnCount(4);
        } else {
          setColumnCount(5);
        }
      };

      updateColumnCount();
      let timeoutId: ReturnType<typeof setTimeout>;
      const debouncedUpdate = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(updateColumnCount, 200);
      };

      window.addEventListener('resize', debouncedUpdate);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', debouncedUpdate);
      };
    }, []);

    const masonryContext = useMemo(
      () => ({
        knowledgeBaseId,
        openFile: onOpenFile,
        selectFileIds,
        setSelectedFileIds,
      }),
      [onOpenFile, knowledgeBaseId, selectFileIds, setSelectedFileIds],
    );

    // Handle scroll for infinite loading
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
      const container = containerRef.current;
      if (!container || !hasMore || isLoadingMore || !loadMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Load more when scrolled past 80%
      if (scrolledPercentage > 0.8) {
        loadMore();
      }
    }, [hasMore, isLoadingMore, loadMore]);

    return (
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Skeleton overlay */}
        {(isTransitioning || !isMasonryReady) && (
          <div
            style={{
              background: 'inherit',
              inset: 0,
              position: 'absolute',
              zIndex: 10,
            }}
          >
            <Skeleton columnCount={columnCount} />
          </div>
        )}
        {/* Masonry content - always rendered but hidden until ready */}
        <div
          onScroll={handleScroll}
          ref={containerRef}
          style={{
            height: '100%',
            opacity: isMasonryReady ? 1 : 0,
            overflowY: 'auto',
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          <div style={{ paddingBlockEnd: 64, paddingBlockStart: 12, paddingInline: 24 }}>
            <VirtuosoMasonry
              ItemContent={MasonryItemWrapper}
              columnCount={columnCount}
              context={masonryContext}
              data={data || []}
              style={{
                gap: '16px',
              }}
            />
            {isLoadingMore && (
              <Center className={styles.loadingMore}>
                <Spin percent={'auto'} size="small" />
              </Center>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default MasonryView;
