import React, { useCallback, useMemo, useState } from 'react';

import { fileService } from '@/services/file';
import { useFileStore } from '@/store/file';
import { FileListItem, QueryFileListParams, QueryFileListResult, SortType } from '@/types/files';

const PAGE_SIZE = 50;

interface UseFileExplorerDataOptions {
  category?: string;
  currentFolderSlug?: string | null;
  knowledgeBaseId?: string;
  query?: string | null;
  sortType?: string;
  sorter?: string;
}

export const useFileExplorerData = ({
  category,
  currentFolderSlug,
  knowledgeBaseId,
  query,
  sortType,
  sorter,
}: UseFileExplorerDataOptions) => {
  const [page, setPage] = useState(0);
  const [additionalPages, setAdditionalPages] = useState<FileListItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);

  // Build params for first page - use useMemo to keep reference stable
  const params = useMemo<QueryFileListParams>(
    () => ({
      category,
      knowledgeBaseId,
      limit: PAGE_SIZE,
      offset: 0,
      parentId: currentFolderSlug ?? undefined,
      q: query ?? undefined,
      showFilesInKnowledgeBase: false,
      sortType: sortType || SortType.Desc,
      sorter: sorter || 'createdAt',
    }),
    [category, knowledgeBaseId, currentFolderSlug, query, sortType, sorter],
  );

  // Fetch first page using SWR
  const { data: firstPageData, isLoading } = useFetchKnowledgeItems(params);

  // Reset additional pages when params change
  React.useEffect(() => {
    setPage(0);
    setAdditionalPages([]);
    setHasMore(false);
    setTotal(0);
  }, [category, knowledgeBaseId, currentFolderSlug, query, sortType, sorter]);

  // Process first page data and extract pagination info
  const { firstPageItems, paginationInfo } = useMemo(() => {
    if (!firstPageData) {
      return { firstPageItems: [], paginationInfo: { hasMore: false, total: 0 } };
    }

    // Check if data is paginated response
    if (typeof firstPageData === 'object' && 'items' in firstPageData) {
      const paginatedData = firstPageData as unknown as QueryFileListResult;
      return {
        firstPageItems: paginatedData.items,
        paginationInfo: { hasMore: paginatedData.hasMore, total: paginatedData.total },
      };
    }

    // Non-paginated response (backward compatibility)
    const items = firstPageData as FileListItem[];
    return {
      firstPageItems: items,
      paginationInfo: { hasMore: false, total: items.length },
    };
  }, [firstPageData]);

  // Update pagination state when first page loads
  React.useEffect(() => {
    if (!isLoading && firstPageData) {
      setHasMore(paginationInfo.hasMore);
      setTotal(paginationInfo.total);
    }
  }, [firstPageData, isLoading, paginationInfo]);

  // Combine first page with additional pages
  const allItems = useMemo(() => {
    return [...firstPageItems, ...additionalPages];
  }, [firstPageItems, additionalPages]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !paginationInfo.hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const nextParams: QueryFileListParams = {
        ...params,
        limit: PAGE_SIZE,
        offset: nextPage * PAGE_SIZE,
      };

      const result = await fileService.getKnowledgeItems(nextParams);

      if (result && typeof result === 'object' && 'items' in result) {
        const paginatedData = result as unknown as QueryFileListResult;
        setAdditionalPages((prev) => [...prev, ...paginatedData.items]);
        setHasMore(paginatedData.hasMore);
        setTotal(paginatedData.total);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, paginationInfo.hasMore, page, params]);

  return {
    data: allItems,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    total,
  };
};
