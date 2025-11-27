'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';

import { useFolderPath } from '@/app/[variants]/(main)/resource/hooks/useFolderPath';
import { useAddFilesToKnowledgeBaseModal } from '@/features/KnowledgeBaseModal';
import { useQueryState } from '@/hooks/useQueryParam';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { FilesTabs, SortType } from '@/types/files';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

import AddButton from '../Header/AddButton';
import EmptyStatus from './EmptyStatus';
import FileListItem, { FILE_DATE_WIDTH, FILE_SIZE_WIDTH } from './FileListItem';
import FileSkeleton from './FileSkeleton';
import FolderBreadcrumb from './FolderBreadcrumb';
import MasonryItemWrapper from './MasonryFileItem/MasonryItemWrapper';
import MasonrySkeleton from './MasonrySkeleton';
import BatchActionsDropdown from './ToolBar/BatchActionsDropdown';
import ExpandableSearch from './ToolBar/ExpandableSearch';
import type { MultiSelectActionType } from './ToolBar/MultiSelectActions';
import SortDropdown from './ToolBar/SortDropdown';
import ViewSwitcher, { ViewMode } from './ToolBar/ViewSwitcher';
import { useCheckTaskStatus } from './useCheckTaskStatus';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  header: css`
    height: 40px;
    min-height: 40px;
    border-block-end: 1px solid ${isDarkMode ? token.colorSplit : rgba(token.colorSplit, 0.06)};
    color: ${token.colorTextDescription};
  `,
  headerItem: css`
    padding-block: 0;
    padding-inline: 0 24px;
  `,
  total: css`
    padding-block-end: 12px;
    border-block-end: 1px solid ${isDarkMode ? token.colorSplit : rgba(token.colorSplit, 0.06)};
  `,
}));

interface FileExplorerProps {
  category?: string;
  knowledgeBaseId?: string;
  onOpenFile?: (id: string) => void;
}

const FileExplorer = memo<FileExplorerProps>(({ knowledgeBaseId, category, onOpenFile }) => {
  const { t } = useTranslation('components');
  const { styles } = useStyles();
  const navigate = useNavigate();

  const [selectFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMasonryReady, setIsMasonryReady] = useState(false);

  // Always use masonry view for Images category, ignore stored preference
  const storedViewMode = useGlobalStore((s) => s.status.fileManagerViewMode);
  const viewMode = (
    category === FilesTabs.Images ? 'masonry' : storedViewMode || 'list'
  ) as ViewMode;
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);
  const setViewMode = (mode: ViewMode) => {
    setIsTransitioning(true);
    if (mode === 'masonry') {
      setIsMasonryReady(false);
    }
    updateSystemStatus({ fileManagerViewMode: mode });
  };

  const [columnCount, setColumnCount] = useState(4);

  // Update column count based on window size
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

  // Set initial column count and listen for resize
  React.useEffect(() => {
    if (viewMode === 'masonry') {
      updateColumnCount();
      window.addEventListener('resize', updateColumnCount);
      return () => window.removeEventListener('resize', updateColumnCount);
    }
  }, [viewMode]);

  const [query] = useQueryState('q', {
    clearOnDefault: true,
  });

  const { currentFolderSlug } = useFolderPath();

  const [sorter] = useQueryState('sorter', {
    clearOnDefault: true,
    defaultValue: 'createdAt',
  });
  const [sortType] = useQueryState('sortType', {
    clearOnDefault: true,
    defaultValue: SortType.Desc,
  });

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

  const { open } = useAddFilesToKnowledgeBaseModal();

  const onActionClick = async (type: MultiSelectActionType) => {
    switch (type) {
      case 'delete': {
        await removeFiles(selectFileIds);
        setSelectedFileIds([]);

        return;
      }
      case 'removeFromKnowledgeBase': {
        if (!knowledgeBaseId) return;

        await removeFromKnowledgeBase(knowledgeBaseId, selectFileIds);
        setSelectedFileIds([]);
        return;
      }
      case 'addToKnowledgeBase': {
        open({
          fileIds: selectFileIds,
          onClose: () => setSelectedFileIds([]),
        });
        return;
      }
      case 'addToOtherKnowledgeBase': {
        open({
          fileIds: selectFileIds,
          knowledgeBaseId,
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
        if (!knowledgeBaseId) return;
        await removeKnowledgeBase(knowledgeBaseId);
        navigate('/knowledge');
        return;
      }
    }
  };

  const setCurrentFolderId = useFileStore((s) => s.setCurrentFolderId);
  const useFetchFolderBreadcrumb = useFileStore((s) => s.useFetchFolderBreadcrumb);
  const { data: folderBreadcrumb } = useFetchFolderBreadcrumb(currentFolderSlug);

  // Update current folder ID based on breadcrumb data
  React.useEffect(() => {
    if (!currentFolderSlug) {
      setCurrentFolderId(null);
    } else if (folderBreadcrumb && folderBreadcrumb.length > 0) {
      // The current folder is the last item in the breadcrumb chain
      const currentFolder = folderBreadcrumb.at(-1);
      setCurrentFolderId(currentFolder?.id ?? null);
    }
  }, [currentFolderSlug, folderBreadcrumb, setCurrentFolderId]);

  const { data: rawData, isLoading } = useFetchKnowledgeItems({
    category,
    knowledgeBaseId,
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

  // Handle view transition with a brief delay to show skeleton
  React.useEffect(() => {
    if (isTransitioning && data) {
      // Use requestAnimationFrame to ensure smooth transition
      requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
        return () => clearTimeout(timer);
      });
    }
  }, [isTransitioning, viewMode, data]);

  // Mark masonry as ready after it has time to mount and render
  React.useEffect(() => {
    if (viewMode === 'masonry' && data && !isLoading && !isTransitioning) {
      // Give VirtuosoMasonry enough time to fully render and calculate layout
      const timer = setTimeout(() => {
        setIsMasonryReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (viewMode === 'list') {
      // Reset when switching to list view
      setIsMasonryReady(false);
    }
  }, [viewMode, data, isLoading, isTransitioning]);

  useCheckTaskStatus(data);

  // Clean up selected files that no longer exist in the data
  React.useEffect(() => {
    if (data && selectFileIds.length > 0) {
      const validFileIds = new Set(data.map((item) => item?.id).filter(Boolean));
      const filteredSelection = selectFileIds.filter((id) => validFileIds.has(id));
      if (filteredSelection.length !== selectFileIds.length) {
        setSelectedFileIds(filteredSelection);
      }
    }
  }, [data]);

  // Reset lastSelectedIndex when selection is cleared
  React.useEffect(() => {
    if (selectFileIds.length === 0) {
      setLastSelectedIndex(null);
    }
  }, [selectFileIds.length]);

  // Memoize context object to avoid recreating on every render
  const masonryContext = useMemo(
    () => ({
      knowledgeBaseId,
      openFile: onOpenFile,
      selectFileIds,
      setSelectedFileIds,
    }),
    [onOpenFile, knowledgeBaseId, selectFileIds],
  );

  const showEmptyStatus = !isLoading && data?.length === 0 && !currentFolderSlug;

  return (
    <Flexbox height={'100%'}>
      <ChatHeader
        left={
          <Flexbox align={'center'} gap={4} horizontal style={{ minHeight: 32 }}>
            <Flexbox align={'center'} style={{ marginLeft: 12 }}>
              <FolderBreadcrumb knowledgeBaseId={knowledgeBaseId} />
            </Flexbox>
          </Flexbox>
        }
        right={
          <Flexbox align={'center'} gap={4} horizontal style={{ minHeight: 32 }}>
            <ExpandableSearch />
            <SortDropdown />
            <BatchActionsDropdown
              isInKnowledgeBase={!!knowledgeBaseId}
              knowledgeBaseId={knowledgeBaseId}
              onActionClick={onActionClick}
              selectCount={selectFileIds.length}
            />
            <ViewSwitcher onViewChange={setViewMode} view={viewMode} />
            <Flexbox style={{ marginLeft: 12 }}>
              <AddButton knowledgeBaseId={knowledgeBaseId} />
            </Flexbox>
          </Flexbox>
        }
        styles={{
          left: { padding: 0 },
        }}
      />
      {showEmptyStatus ? (
        <EmptyStatus knowledgeBaseId={knowledgeBaseId} showKnowledgeBase={!knowledgeBaseId} />
      ) : (
        <>
          <Flexbox style={{ fontSize: 12, marginTop: 56 }}>
            {viewMode === 'list' && (
              <Flexbox align={'center'} className={styles.header} horizontal paddingInline={8}>
                <Flexbox className={styles.headerItem} flex={1} style={{ paddingInline: 32 }}>
                  {t('FileManager.title.title')}
                </Flexbox>
                <Flexbox className={styles.headerItem} width={FILE_DATE_WIDTH}>
                  {t('FileManager.title.createdAt')}
                </Flexbox>
                <Flexbox className={styles.headerItem} width={FILE_SIZE_WIDTH}>
                  {t('FileManager.title.size')}
                </Flexbox>
              </Flexbox>
            )}
          </Flexbox>
          {isLoading || (viewMode === 'list' && isTransitioning) ? (
            <FileSkeleton />
          ) : viewMode === 'list' ? (
            <Virtuoso
              data={data}
              itemContent={(index, item) => (
                <FileListItem
                  index={index}
                  key={item.id}
                  knowledgeBaseId={knowledgeBaseId}
                  onSelectedChange={(id, checked, shiftKey, clickedIndex) => {
                    if (
                      shiftKey &&
                      lastSelectedIndex !== null &&
                      selectFileIds.length > 0 &&
                      data
                    ) {
                      // Range selection with shift key
                      const start = Math.min(lastSelectedIndex, clickedIndex);
                      const end = Math.max(lastSelectedIndex, clickedIndex);
                      const rangeIds = data.slice(start, end + 1).map((item) => item.id);

                      setSelectedFileIds((prev) => {
                        // Create a Set for efficient lookup
                        const prevSet = new Set(prev);
                        // Add all items in range
                        rangeIds.forEach((rangeId) => prevSet.add(rangeId));
                        return Array.from(prevSet);
                      });
                    } else {
                      // Normal selection
                      setSelectedFileIds((prev) => {
                        if (checked) {
                          return [...prev, id];
                        }
                        return prev.filter((item) => item !== id);
                      });
                    }
                    setLastSelectedIndex(clickedIndex);
                  }}
                  pendingRenameItemId={pendingRenameItemId}
                  selected={selectFileIds.includes(item.id)}
                  {...item}
                />
              )}
              style={{ flex: 1 }}
            />
          ) : (
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
                  <MasonrySkeleton columnCount={columnCount} />
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
          )}
        </>
      )}
    </Flexbox>
  );
});

export default FileExplorer;
