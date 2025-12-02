'use client';

import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { memo, useEffect, useMemo, useState } from 'react';

import { FileListItem } from '@/types/files';

import MasonryItemWrapper from '../MasonryFileItem/MasonryItemWrapper';
import Skeleton from './Skeleton';

interface MasonryViewProps {
  data: FileListItem[] | undefined;
  isMasonryReady: boolean;
  isTransitioning: boolean;
  knowledgeBaseId?: string;
  onOpenFile?: (id: string) => void;
  selectFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
}

const MasonryView = memo<MasonryViewProps>(
  ({
    data,
    isMasonryReady,
    isTransitioning,
    knowledgeBaseId,
    onOpenFile,
    selectFileIds,
    setSelectedFileIds,
  }) => {
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
      window.addEventListener('resize', updateColumnCount);
      return () => window.removeEventListener('resize', updateColumnCount);
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
          </div>
        </div>
      </div>
    );
  },
);

export default MasonryView;
