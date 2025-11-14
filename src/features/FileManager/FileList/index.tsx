'use client';

import { Text } from '@lobehub/ui';
import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { createStyles } from 'antd-style';
import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { rgba } from 'polished';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { FileListItem as FileListItemType, SortType } from '@/types/files';

import EmptyStatus from './EmptyStatus';
import FileListItem, { FILE_DATE_WIDTH, FILE_SIZE_WIDTH } from './FileListItem';
import FileSkeleton from './FileSkeleton';
import MasonryItemWrapper from './MasonryFileItem/MasonryItemWrapper';
import MasonrySkeleton from './MasonrySkeleton';
import ToolBar from './ToolBar';
import { ViewMode } from './ToolBar/ViewSwitcher';
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

  sortButton: css`
    cursor: pointer;

    display: inline-flex;

    border: none;

    vertical-align: middle;

    background: transparent;
  `,

  total: css`
    padding-block-end: 12px;
    border-block-end: 1px solid ${isDarkMode ? token.colorSplit : rgba(token.colorSplit, 0.06)};
  `,
}));

interface FileListProps {
  category?: string;
  knowledgeBaseId?: string;
  onOpenFile: (id: string) => void;
}

const FileList = memo<FileListProps>(({ knowledgeBaseId, category, onOpenFile }) => {
  const { t } = useTranslation('components');
  const { styles } = useStyles();

  const [selectFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [viewConfig, setViewConfig] = useState({ showFilesInKnowledgeBase: false });
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const viewMode = useGlobalStore((s) => s.status.fileManagerViewMode || 'list') as ViewMode;
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);
  const setViewMode = (mode: ViewMode) => {
    setIsTransitioning(true);
    updateSystemStatus({ fileManagerViewMode: mode });
  };

  const [sortType, sorter] = useGlobalStore((s) => [
    systemStatusSelectors.fileListSortType(s),
    systemStatusSelectors.fileListSorter(s),
  ]);

  const [columnCount, setColumnCount] = useState(4);

  // Update column count based on window size
  const updateColumnCount = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setColumnCount(2);
    } else if (width < 1024) {
      setColumnCount(3);
    } else if (width < 1440) {
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

  const useFetchFileManage = useFileStore((s) => s.useFetchFileManage);

  const { data, isLoading } = useFetchFileManage({
    category,
    knowledgeBaseId,
    q: query,
    ...viewConfig,
  });

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return data; // 防止data第一次加载中提前渲染
    if (!sorter) return data;

    const key = sorter as keyof FileListItemType;

    return [...data].sort((a, b) => {
      let compare = 0;
      switch (key) {
        case 'name': {
          compare = a.name.localeCompare(b.name);
          break;
        }
        case 'createdAt': {
          compare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        }
        case 'size': {
          compare = a.size - b.size;
          break;
        }
        default: {
          break;
        }
      }
      return sortType === SortType.Asc ? compare : -compare;
    });
  }, [data, sorter, sortType]);

  const handleSort = (key: 'name' | 'createdAt' | 'size') => {
    if (sorter === key) {
      updateSystemStatus({
        fileListSortType: sortType === SortType.Asc ? SortType.Desc : SortType.Asc,
      });
    } else {
      updateSystemStatus({
        fileListSortType: key === 'name' ? SortType.Asc : SortType.Desc,
        fileListSorter: key,
      });
    }
  };

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

  return !isLoading && sortedData?.length === 0 ? (
    <EmptyStatus knowledgeBaseId={knowledgeBaseId} showKnowledgeBase={!knowledgeBaseId} />
  ) : (
    <Flexbox height={'100%'}>
      <Flexbox style={{ fontSize: 12, marginInline: 24 }}>
        <ToolBar
          config={viewConfig}
          key={selectFileIds.join('-')}
          knowledgeBaseId={knowledgeBaseId}
          onConfigChange={setViewConfig}
          onViewChange={setViewMode}
          selectCount={selectFileIds.length}
          selectFileIds={selectFileIds}
          setSelectedFileIds={setSelectedFileIds}
          showConfig={!knowledgeBaseId}
          total={sortedData?.length}
          totalFileIds={sortedData?.map((item) => item.id) || []}
          viewMode={viewMode}
        />
        {viewMode === 'list' && (
          <Flexbox align={'center'} className={styles.header} horizontal paddingInline={8}>
            <Flexbox className={styles.headerItem} flex={1} style={{ paddingInline: 32 }}>
              <span>
                {t('FileManager.title.title')}
                <button
                  aria-label="sort-title"
                  className={styles.sortButton}
                  onClick={() => handleSort('name')}
                  type="button"
                >
                  {sorter === 'name' ? (
                    sortType === SortType.Desc ? (
                      <ArrowDown size={14} />
                    ) : (
                      <ArrowUp size={14} />
                    )
                  ) : (
                    <ArrowDownUp size={14} />
                  )}
                </button>
              </span>
            </Flexbox>
            <Flexbox className={styles.headerItem} width={FILE_DATE_WIDTH}>
              <span>
                {t('FileManager.title.createdAt')}
                <button
                  aria-label="sort-createdAt"
                  className={styles.sortButton}
                  onClick={() => handleSort('createdAt')}
                  type="button"
                >
                  {sorter === 'createdAt' ? (
                    sortType === SortType.Desc ? (
                      <ArrowDown size={14} />
                    ) : (
                      <ArrowUp size={14} />
                    )
                  ) : (
                    <ArrowDownUp size={14} />
                  )}
                </button>
              </span>
            </Flexbox>
            <Flexbox className={styles.headerItem} width={FILE_SIZE_WIDTH}>
              <span>
                {t('FileManager.title.size')}
                <button
                  aria-label="sort-size"
                  className={styles.sortButton}
                  onClick={() => handleSort('size')}
                  type="button"
                >
                  {sorter === 'size' ? (
                    sortType === SortType.Desc ? (
                      <ArrowDown size={14} />
                    ) : (
                      <ArrowUp size={14} />
                    )
                  ) : (
                    <ArrowDownUp size={14} />
                  )}
                </button>
              </span>
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
      {isLoading || isTransitioning ? (
        viewMode === 'masonry' ? (
          <MasonrySkeleton columnCount={columnCount} />
        ) : (
          <FileSkeleton />
        )
      ) : viewMode === 'list' ? (
        <Virtuoso
          components={{
            Footer: () => (
              <Center style={{ height: 64 }}>
                <Text style={{ fontSize: 12 }} type={'secondary'}>
                  {t('FileManager.bottom')}
                </Text>
              </Center>
            ),
          }}
          data={sortedData}
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
                  sortedData
                ) {
                  // Range selection with shift key
                  const start = Math.min(lastSelectedIndex, clickedIndex);
                  const end = Math.max(lastSelectedIndex, clickedIndex);
                  const rangeIds = sortedData.slice(start, end + 1).map((item) => item.id);

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
              selected={selectFileIds.includes(item.id)}
              {...item}
            />
          )}
          style={{ flex: 1 }}
        />
      ) : (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ paddingBlockEnd: 64, paddingBlockStart: 12, paddingInline: 24 }}>
              <VirtuosoMasonry
                ItemContent={MasonryItemWrapper}
                columnCount={columnCount}
                context={masonryContext}
                data={sortedData || []}
                style={{
                  gap: '16px',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Flexbox>
  );
});

export default FileList;
