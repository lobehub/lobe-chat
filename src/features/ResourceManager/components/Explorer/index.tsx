'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';

import EmptyPlaceholder from './EmptyPlaceholder';
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
const ResourceExplorer = memo(() => {
  const [libraryId, category] = useResourceManagerStore((s) => [s.libraryId, s.category]);

  const {
    // Data
    data,
    isLoading,
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

  const columnCount = useMasonryColumnCount();

  const showSkeleton =
    isLoading ||
    (viewMode === 'list' && isTransitioning) ||
    (viewMode === 'masonry' && (isTransitioning || !isMasonryReady));

  return (
    <Flexbox height={'100%'}>
      <Header />
      {showEmptyStatus ? (
        <EmptyPlaceholder />
      ) : showSkeleton ? (
        viewMode === 'list' ? (
          <ListViewSkeleton />
        ) : (
          <MasonryViewSkeleton columnCount={columnCount} />
        )
      ) : viewMode === 'list' ? (
        <ListView
          data={data}
          onSelectionChange={handleSelectionChange}
          pendingRenameItemId={pendingRenameItemId}
          selectFileIds={selectFileIds}
        />
      ) : (
        <MasonryView
          data={data}
          isMasonryReady={isMasonryReady}
          selectFileIds={selectFileIds}
          setSelectedFileIds={setSelectedFileIds}
        />
      )}
    </Flexbox>
  );
});

ResourceExplorer.displayName = 'ResourceExplorer';

export default ResourceExplorer;
