'use client';

import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { VList } from 'virtua';

import { FileListItem as FileListItemType } from '@/types/files';

import FileListItem, { FILE_DATE_WIDTH, FILE_SIZE_WIDTH } from '../FileListItem';

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
  loadingMore: css`
    padding: 16px;
    color: ${token.colorTextSecondary};
  `,
}));

interface ListViewProps {
  data: FileListItemType[] | undefined;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  knowledgeBaseId?: string;
  loadMore?: () => void;
  onSelectionChange: (
    id: string,
    checked: boolean,
    shiftKey: boolean,
    clickedIndex: number,
  ) => void;
  pendingRenameItemId?: string | null;
  selectFileIds: string[];
}

const ListView = memo<ListViewProps>(
  ({
    data,
    hasMore,
    isLoadingMore,
    knowledgeBaseId,
    loadMore,
    onSelectionChange,
    pendingRenameItemId,
    selectFileIds,
  }) => {
    const { t } = useTranslation('components');
    const { styles } = useStyles();
    const virtuaRef = useRef<any>(null);

    // Handle infinite scroll
    const handleScroll = useCallback(() => {
      if (!virtuaRef.current || !data || !hasMore || isLoadingMore || !loadMore) return;

      const { scrollOffset, scrollSize, viewportSize } = virtuaRef.current;
      const scrolledPercentage = (scrollOffset + viewportSize) / scrollSize;

      // Load more when scrolled past 80%
      if (scrolledPercentage > 0.8) {
        loadMore();
      }
    }, [data, hasMore, isLoadingMore, loadMore]);

    return (
      <>
        <Flexbox style={{ fontSize: 12 }}>
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
        </Flexbox>
        <VList bufferSize={800} onScroll={handleScroll} ref={virtuaRef} style={{ height: '100%' }}>
          {data?.map((item, index) => (
            <FileListItem
              index={index}
              key={item.id}
              knowledgeBaseId={knowledgeBaseId}
              onSelectedChange={onSelectionChange}
              pendingRenameItemId={pendingRenameItemId}
              selected={selectFileIds.includes(item.id)}
              {...item}
            />
          ))}
          {isLoadingMore && (
            <Center className={styles.loadingMore}>
              <Spin percent={'auto'} size="small" />
            </Center>
          )}
        </VList>
      </>
    );
  },
);

export default ListView;
