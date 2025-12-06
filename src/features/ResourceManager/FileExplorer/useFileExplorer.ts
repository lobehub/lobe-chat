import { useEffect } from 'react';

import { useFolderPath } from '@/app/[variants]/(main)/resource/features/hooks/useFolderPath';
import { useQueryState } from '@/hooks/useQueryParam';
import { useFileStore } from '@/store/file';
import { SortType } from '@/types/files';

import { useFileExplorerActions } from './hooks/useFileExplorerActions';
import { useFileExplorerData } from './hooks/useFileExplorerData';
import { useFileExplorerSelection } from './hooks/useFileExplorerSelection';
import { useFileExplorerView } from './hooks/useFileExplorerView';
import { useCheckTaskStatus } from './useCheckTaskStatus';

interface UseFileExplorerOptions {
  category?: string;
  knowledgeBaseId?: string;
}

export const useFileExplorer = ({ category, knowledgeBaseId }: UseFileExplorerOptions) => {
  // Query state
  const [query] = useQueryState('q', { clearOnDefault: true });
  const { currentFolderSlug } = useFolderPath();

  const [sorter] = useQueryState('sorter', {
    clearOnDefault: true,
    defaultValue: 'createdAt',
  });
  const [sortType] = useQueryState('sortType', {
    clearOnDefault: true,
    defaultValue: SortType.Desc,
  });

  // Use modular hooks
  const { data, isLoading, isLoadingMore, hasMore, loadMore } = useFileExplorerData({
    category,
    currentFolderSlug,
    knowledgeBaseId,
    query: query ?? undefined,
    sortType: sortType ?? undefined,
    sorter: sorter ?? undefined,
  });

  const { viewMode, isTransitioning, isMasonryReady, setViewMode } = useFileExplorerView(category);

  const { selectFileIds, setSelectedFileIds, handleSelectionChange } =
    useFileExplorerSelection(data);

  const { onActionClick } = useFileExplorerActions(
    selectFileIds,
    setSelectedFileIds,
    knowledgeBaseId,
  );

  // Folder state management
  const setCurrentFolderId = useFileStore((s) => s.setCurrentFolderId);
  const useFetchFolderBreadcrumb = useFileStore((s) => s.useFetchFolderBreadcrumb);
  const { data: folderBreadcrumb } = useFetchFolderBreadcrumb(currentFolderSlug);
  const pendingRenameItemId = useFileStore((s) => s.pendingRenameItemId);

  // Check task status
  useCheckTaskStatus(data);

  // Sync folder ID with current folder slug
  useEffect(() => {
    if (!currentFolderSlug) {
      setCurrentFolderId(null);
    } else if (folderBreadcrumb && folderBreadcrumb.length > 0) {
      const currentFolder = folderBreadcrumb.at(-1);
      setCurrentFolderId(currentFolder?.id ?? null);
    }
  }, [currentFolderSlug, folderBreadcrumb, setCurrentFolderId]);

  const showEmptyStatus = !isLoading && data?.length === 0 && !currentFolderSlug;

  return {
    // Data
    data,
    // Handlers
    handleSelectionChange,

    hasMore,

    isLoading,

    isLoadingMore,

    // State
    isMasonryReady,

    isTransitioning,

    loadMore,

    onActionClick,

    pendingRenameItemId,

    selectFileIds,
    setSelectedFileIds,
    setViewMode,
    showEmptyStatus,
    viewMode,
  };
};
