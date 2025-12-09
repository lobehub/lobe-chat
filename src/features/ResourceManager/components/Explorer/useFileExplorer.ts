import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/resource/features/hooks/useFolderPath';
import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import { useAddFilesToKnowledgeBaseModal } from '@/features/LibraryModal';
import { useQueryState } from '@/hooks/useQueryParam';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { FilesTabs, SortType } from '@/types/files';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

import type { MultiSelectActionType } from './ToolBar/MultiSelectActions';
import { useFileSelection } from './hooks/useFileSelection';
import { useCheckTaskStatus } from './useCheckTaskStatus';

interface UseFileExplorerProps {
  category?: FilesTabs;
  libraryId?: string;
}

export const useFileExplorer = ({ category: categoryProp, libraryId }: UseFileExplorerProps) => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  // View state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMasonryReady, setIsMasonryReady] = useState(false);

  // Mode state
  const [mode, setMode, viewMode, currentViewItemId, setCurrentViewItemId] =
    useResourceManagerStore((s) => [
      s.mode,
      s.setMode,
      s.viewMode,
      s.currentViewItemId,
      s.setCurrentViewItemId,
    ]);
  const categoryFromStore = useResourceManagerStore((s) => s.category);
  const category = categoryProp ?? categoryFromStore;

  // Current file
  const useFetchKnowledgeItem = useFileStore((s) => s.useFetchKnowledgeItem);
  const { data: fetchedCurrentFile } = useFetchKnowledgeItem(currentViewItemId);
  const currentFile =
    useFileStore(fileManagerSelectors.getFileById(currentViewItemId)) || fetchedCurrentFile;

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

  // File operations
  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);
  const [removeFiles, parseFilesToChunks, fileList, pendingRenameItemId] = useFileStore((s) => [
    s.removeFiles,
    s.parseFilesToChunks,
    s.fileList,
    s.pendingRenameItemId,
  ]);
  const [removeFromKnowledgeBase, removeKnowledgeBase] = useKnowledgeBaseStore((s) => [
    s.removeFilesFromKnowledgeBase,
    s.removeKnowledgeBase,
  ]);

  const { open: openAddModal } = useAddFilesToKnowledgeBaseModal();

  // Folder operations
  const setCurrentFolderId = useFileStore((s) => s.setCurrentFolderId);
  const useFetchFolderBreadcrumb = useFileStore((s) => s.useFetchFolderBreadcrumb);
  const { data: folderBreadcrumb } = useFetchFolderBreadcrumb(currentFolderSlug);

  // Fetch data
  const { data: rawData, isLoading } = useFetchKnowledgeItems({
    category,
    knowledgeBaseId: libraryId,
    parentId: currentFolderSlug || null,
    q: query ?? undefined,
    showFilesInKnowledgeBase: false,
  });

  // Client-side sorting
  const data = useMemo(() => {
    if (!rawData) return rawData;

    const sorted = [...rawData];
    const currentSorter = sorter || 'createdAt';
    const currentSortType = sortType || SortType.Desc;

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (currentSorter) {
        case 'name': {
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        }
        case 'size': {
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        }
        default: {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        }
      }

      if (currentSortType === SortType.Asc) {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });

    return sorted;
  }, [rawData, sorter, sortType]);

  const { handleSelectionChange, selectFileIds, setSelectedFileIds } = useFileSelection(data);

  useCheckTaskStatus(data);

  // Action handlers
  const onActionClick = useCallback(
    async (type: MultiSelectActionType) => {
      switch (type) {
        case 'delete': {
          // Separate documents/pages from regular files
          const documentsToDelete: string[] = [];
          const filesToDelete: string[] = [];

          selectFileIds.forEach((id) => {
            const item = data?.find((f) => f.id === id);
            if (!item) return;

            const isPage = item.sourceType === 'document' || item.fileType === 'custom/document';
            const isFolder = item.fileType === 'custom/folder';

            if (isPage || isFolder) {
              documentsToDelete.push(id);
            } else {
              filesToDelete.push(id);
            }
          });

          // Delete documents using batch delete endpoint
          if (documentsToDelete.length > 0) {
            const { documentService } = await import('@/services/document');
            await documentService.deleteDocuments(documentsToDelete);
          }

          // Delete regular files using file service
          if (filesToDelete.length > 0) {
            await removeFiles(filesToDelete);
          } else {
            // If only documents were deleted, still refresh the file list
            const refreshFileList = useFileStore.getState().refreshFileList;
            await refreshFileList();
          }

          setSelectedFileIds([]);
          return;
        }
        case 'removeFromKnowledgeBase': {
          if (!libraryId) return;
          await removeFromKnowledgeBase(libraryId, selectFileIds);
          setSelectedFileIds([]);
          return;
        }
        case 'addToKnowledgeBase': {
          openAddModal({
            fileIds: selectFileIds,
            onClose: () => setSelectedFileIds([]),
          });
          return;
        }
        case 'addToOtherKnowledgeBase': {
          openAddModal({
            fileIds: selectFileIds,
            knowledgeBaseId: libraryId,
            onClose: () => setSelectedFileIds([]),
          });
          return;
        }
        case 'batchChunking': {
          const chunkableFileIds = selectFileIds.filter((id) => {
            const file = fileList.find((f) => f.id === id);
            return file && !isChunkingUnsupported(file.fileType);
          });
          await parseFilesToChunks(chunkableFileIds, { skipExist: true });
          setSelectedFileIds([]);
          return;
        }
        case 'deleteLibrary': {
          if (!libraryId) return;
          await removeKnowledgeBase(libraryId);
          navigate('/knowledge');
          return;
        }
      }
    },
    [
      selectFileIds,
      libraryId,
      removeFiles,
      removeFromKnowledgeBase,
      removeKnowledgeBase,
      parseFilesToChunks,
      fileList,
      openAddModal,
      setSelectedFileIds,
      navigate,
    ],
  );

  const handleBackToList = useCallback(() => {
    setMode('explorer');
    setCurrentViewItemId(undefined);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('file');
      return newParams;
    });
  }, [setMode, setCurrentViewItemId, setSearchParams]);

  // Effects
  React.useEffect(() => {
    if (!currentFolderSlug) {
      setCurrentFolderId(null);
    } else if (folderBreadcrumb && folderBreadcrumb.length > 0) {
      const currentFolder = folderBreadcrumb.at(-1);
      setCurrentFolderId(currentFolder?.id ?? null);
    }
  }, [currentFolderSlug, folderBreadcrumb, setCurrentFolderId]);

  // Handle view mode transition effects
  useEffect(() => {
    if (viewMode === 'masonry') {
      setIsTransitioning(true);
      setIsMasonryReady(false);
    }
  }, [viewMode]);

  useEffect(() => {
    if (isTransitioning && data) {
      requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
        return () => clearTimeout(timer);
      });
    }
  }, [isTransitioning, viewMode, data]);

  useEffect(() => {
    if (viewMode === 'masonry' && data && !isLoading && !isTransitioning) {
      const timer = setTimeout(() => {
        setIsMasonryReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (viewMode === 'list') {
      setIsMasonryReady(false);
    }
  }, [viewMode, data, isLoading, isTransitioning]);

  const showEmptyStatus = !isLoading && data?.length === 0 && !currentFolderSlug;
  const isFilePreviewMode = mode === 'editor' && currentViewItemId;

  return {
    // Data
    category,
    currentFile,
    currentFolderSlug,
    currentViewItemId,
    data,
    // Handlers
    handleBackToList,

    handleSelectionChange,

    isFilePreviewMode,

    isLoading,

    // State
    isMasonryReady,

    isTransitioning,

    onActionClick,

    pendingRenameItemId,

    selectFileIds,
    setSelectedFileIds,
    showEmptyStatus,
    viewMode,
  };
};
