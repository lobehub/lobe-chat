import { useCallback, useState } from 'react';

import AsyncError from '@/components/AsyncError';
import { useFileStore } from '@/store/file';

import ListViewSkeleton from './Skeleton';

interface UseExplorerInfiniteScrollOptions {
  columnWidths: {
    date: number;
    name: number;
    size: number;
    uploader: number;
  };
  dataLength: number;
  hasMore: boolean;
  /** Next-page loader; defaults to the folder list's. */
  loadMore?: () => Promise<void>;
  /**
   * Failure of a page past the head. The list stops auto-loading while it is
   * set, so scrolling cannot hammer a failing request, and the footer turns into
   * an explicit retry instead of a missing loading row.
   */
  loadMoreError?: unknown;
  showUploader?: boolean;
}

export const useExplorerInfiniteScroll = ({
  columnWidths,
  dataLength,
  hasMore,
  loadMore,
  loadMoreError,
  showUploader = true,
}: UseExplorerInfiniteScrollOptions) => {
  const loadMoreResources = useFileStore((s) => s.loadMoreResources);
  const loadNextPage = loadMore ?? loadMoreResources;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleEndReached = useCallback(async () => {
    if (!hasMore || isLoadingMore || loadMoreError) return;

    setIsLoadingMore(true);
    try {
      await loadNextPage();
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, loadMoreError, loadNextPage]);

  const retryLoadMore = useCallback(() => {
    void handleEndReached();
  }, [handleEndReached]);

  const Footer = useCallback(() => {
    if (loadMoreError)
      return (
        <AsyncError
          error={loadMoreError}
          retrying={isLoadingMore}
          variant={'inline'}
          onRetry={retryLoadMore}
        />
      );
    if (isLoadingMore && hasMore)
      return <ListViewSkeleton columnWidths={columnWidths} showUploader={showUploader} />;
    if (hasMore === false && dataLength > 0) return <div aria-hidden style={{ height: 96 }} />;

    return null;
  }, [columnWidths, dataLength, hasMore, isLoadingMore, loadMoreError, retryLoadMore, showUploader]);

  return {
    Footer,
    handleEndReached,
  };
};
