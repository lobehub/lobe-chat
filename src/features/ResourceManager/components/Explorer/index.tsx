'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';

import EmptyStatus from './EmptyStatus';
import Header from './Header';
import ListView from './ListView';
import ListViewSkeleton from './ListView/Skeleton';
import MasonryView from './MasonryView';
import MasonryViewSkeleton from './MasonryView/Skeleton';
import { useFileExplorer } from './useFileExplorer';
import { useMasonryColumnCount } from './useMasonryColumnCount';

/**
 * Explore resource items in a library
 *
 * Works with FileTree
 *
 * It's a un-reusable component for business logic only.
 * So we depend on context, not props.
 */
const FileExplorer = memo(() => {
  const libraryId = useResourceManagerStore((s) => s.libraryId);
  const category = useResourceManagerStore((s) => s.category);

  const {
    // Data
    data,
    isLoading,
    knowledgeBaseId,
    pendingRenameItemId,

    // State
    isMasonryReady,
    isTransitioning,
    selectFileIds,
    showEmptyStatus,
    viewMode,

    // Handlers
    handleSelectionChange,
    setSelectedFileIds,
  } = useFileExplorer({ category, libraryId });

  // Calculate column count for masonry view
  const columnCount = useMasonryColumnCount();

  // Determine if skeleton should be shown
  const showSkeleton =
    isLoading ||
    (viewMode === 'list' && isTransitioning) ||
    (viewMode === 'masonry' && (isTransitioning || !isMasonryReady));

  return (
    <Flexbox height={'100%'}>
      <Header />
      {showEmptyStatus ? (
        <EmptyStatus knowledgeBaseId={knowledgeBaseId} showKnowledgeBase={!knowledgeBaseId} />
      ) : showSkeleton ? (
        viewMode === 'list' ? (
          <ListViewSkeleton />
        ) : (
          <MasonryViewSkeleton columnCount={columnCount} />
        )
      ) : viewMode === 'list' ? (
        <ListView
          data={data}
          knowledgeBaseId={knowledgeBaseId}
          onSelectionChange={handleSelectionChange}
          pendingRenameItemId={pendingRenameItemId}
          selectFileIds={selectFileIds}
        />
      ) : (
        <MasonryView
          data={data}
          isMasonryReady={isMasonryReady}
          knowledgeBaseId={knowledgeBaseId}
          selectFileIds={selectFileIds}
          setSelectedFileIds={setSelectedFileIds}
        />
      )}
    </Flexbox>
  );
});

export default FileExplorer;
