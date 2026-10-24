import { useCallback, useState } from 'react';

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
  showUploader?: boolean;
}

export const useExplorerInfiniteScroll = ({
  columnWidths,
  dataLength,
  hasMore,
  loadMore,
  showUploader = true,
}: UseExplorerInfiniteScrollOptions) => {
  const loadMoreResources = useFileStore((s) => s.loadMoreResources);
  const loadNextPage = loadMore ?? loadMoreResources;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleEndReached = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await loadNextPage();
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, loadNextPage]);

  const Footer = useCallback(() => {
    if (isLoadingMore && hasMore)
      return <ListViewSkeleton columnWidths={columnWidths} showUploader={showUploader} />;
    if (hasMore === false && dataLength > 0) return <div aria-hidden style={{ height: 96 }} />;

    return null;
  }, [columnWidths, dataLength, hasMore, isLoadingMore, showUploader]);

  return {
    Footer,
    handleEndReached,
  };
};
