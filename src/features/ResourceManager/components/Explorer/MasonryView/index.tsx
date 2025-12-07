'use client';

import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { memo, useMemo } from 'react';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import { FileListItem } from '@/types/files';

import MasonryItemWrapper from '../MasonryFileItem/MasonryItemWrapper';
import { useMasonryColumnCount } from '../useMasonryColumnCount';

interface MasonryViewProps {
  data: FileListItem[] | undefined;
  isMasonryReady: boolean;
  onOpenFile?: (id: string) => void;
  selectFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
}

const MasonryView = memo<MasonryViewProps>(
  ({ data, isMasonryReady, onOpenFile, selectFileIds, setSelectedFileIds }) => {
    const columnCount = useMasonryColumnCount();

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
    );
  },
);

export default MasonryView;
