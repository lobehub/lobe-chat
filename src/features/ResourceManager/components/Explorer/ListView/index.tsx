'use client';

import { Checkbox } from 'antd';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { VList, VListHandle } from 'virtua';

import { FileListItem as FileListItemType } from '@/types/files';

import FileListItem, { FILE_DATE_WIDTH, FILE_SIZE_WIDTH } from './ListItem';

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
}));

interface ListViewProps {
  data: FileListItemType[] | undefined;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  onSelectionChange: (
    id: string,
    checked: boolean,
    shiftKey: boolean,
    clickedIndex: number,
  ) => void;
  pendingRenameItemId?: string | null;
  selectFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
}

const ListView = memo<ListViewProps>(
  ({
    data,
    hasMore,
    loadMore,
    onSelectionChange,
    pendingRenameItemId,
    selectFileIds,
    setSelectedFileIds,
  }) => {
    const { t } = useTranslation('components');
    const { styles } = useStyles();
    const virtuaRef = useRef<VListHandle>(null);
    const isLoadingMore = useRef(false);

    // Calculate select all checkbox state
    const { allSelected, indeterminate } = useMemo(() => {
      const fileCount = data?.length || 0;
      const selectedCount = selectFileIds.length;
      return {
        allSelected: fileCount > 0 && selectedCount === fileCount,
        indeterminate: selectedCount > 0 && selectedCount < fileCount,
      };
    }, [data, selectFileIds]);

    // Handle select all checkbox change
    const handleSelectAll = () => {
      if (allSelected) {
        setSelectedFileIds([]);
      } else {
        setSelectedFileIds(data?.map((item) => item.id) || []);
      }
    };

    // Handle scroll to detect when reaching bottom
    const handleScroll = useCallback(() => {
      const ref = virtuaRef.current;
      if (!ref || !hasMore || isLoadingMore.current) return;

      const scrollOffset = ref.scrollOffset;
      const scrollSize = ref.scrollSize;
      const viewportSize = ref.viewportSize;

      // Trigger load more when within 200px of the bottom
      const threshold = 200;
      if (scrollSize - scrollOffset - viewportSize <= threshold) {
        isLoadingMore.current = true;
        loadMore().finally(() => {
          isLoadingMore.current = false;
        });
      }
    }, [hasMore, loadMore]);

    return (
      <>
        <Flexbox style={{ fontSize: 12 }}>
          <Flexbox align={'center'} className={styles.header} horizontal paddingInline={8}>
            <Center height={40} style={{ paddingInline: 4 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={indeterminate}
                onChange={handleSelectAll}
              />
            </Center>
            <Flexbox className={styles.headerItem} flex={1} style={{ paddingInline: 8 }}>
              {t('FileManager.title.title')}
            </Flexbox>
            <Flexbox className={styles.headerItem} width={FILE_DATE_WIDTH}>
              {t('FileManager.title.createdAt')}
            </Flexbox>
            <Flexbox className={styles.headerItem} width={FILE_SIZE_WIDTH}>
              {t('FileManager.title.size')}
            </Flexbox>
          </Flexbox>
        </Flexbox>
        <VList
          bufferSize={typeof window !== 'undefined' ? window.innerHeight : 0}
          data={data}
          itemSize={48}
          onScroll={handleScroll}
          ref={virtuaRef}
          style={{ height: '100%' }}
        >
          {(item, index) => (
            <FileListItem
              index={index}
              key={item.id}
              onSelectedChange={onSelectionChange}
              pendingRenameItemId={pendingRenameItemId}
              selected={selectFileIds.includes(item.id)}
              {...item}
            />
          )}
        </VList>
      </>
    );
  },
);

export default ListView;
