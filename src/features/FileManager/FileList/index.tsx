'use client';

import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useQueryState } from 'nuqs';
import { rgba } from 'polished';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useFileStore } from '@/store/file';
import { SortType } from '@/types/files';

import EmptyStatus from './EmptyStatus';
import FileListItem, { FILE_DATE_WIDTH, FILE_SIZE_WIDTH } from './FileListItem';
import FileSkeleton from './FileSkeleton';
import ToolBar from './ToolBar';
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

interface FileListProps {
  category?: string;
  knowledgeBaseId?: string;
}

const FileList = memo<FileListProps>(({ knowledgeBaseId, category }) => {
  const { t } = useTranslation('components');
  const { styles } = useStyles();

  const [selectFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [viewConfig, setViewConfig] = useState({ showFilesInKnowledgeBase: false });

  const [query] = useQueryState('q', {
    clearOnDefault: true,
  });

  const [sorter] = useQueryState('sorter', {
    clearOnDefault: true,
    defaultValue: 'createdAt',
  });
  const [sortType] = useQueryState('sortType', {
    clearOnDefault: true,
    defaultValue: SortType.Desc,
  });

  const useFetchFileManage = useFileStore((s) => s.useFetchFileManage);

  const { data, isLoading } = useFetchFileManage({
    category,
    knowledgeBaseId,
    q: query,
    sortType,
    sorter,
    ...viewConfig,
  });

  useCheckTaskStatus(data);

  return !isLoading && data?.length === 0 ? (
    <EmptyStatus knowledgeBaseId={knowledgeBaseId} showKnowledgeBase={!knowledgeBaseId} />
  ) : (
    <Flexbox height={'100%'}>
      <Flexbox style={{ fontSize: 12, marginInline: 24 }}>
        <ToolBar
          config={viewConfig}
          key={selectFileIds.join('-')}
          knowledgeBaseId={knowledgeBaseId}
          onConfigChange={setViewConfig}
          selectCount={selectFileIds.length}
          selectFileIds={selectFileIds}
          setSelectedFileIds={setSelectedFileIds}
          showConfig={!knowledgeBaseId}
          total={data?.length}
          totalFileIds={data?.map((item) => item.id) || []}
        />
        <Flexbox align={'center'} className={styles.header} horizontal>
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
      {isLoading ? (
        <FileSkeleton />
      ) : (
        <Virtuoso
          components={{
            Footer: () => (
              <Center style={{ height: 64 }}>
                <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
                  {t('FileManager.bottom')}
                </Typography.Text>
              </Center>
            ),
          }}
          data={data}
          itemContent={(index, item) => (
            <FileListItem
              index={index}
              key={item.id}
              knowledgeBaseId={knowledgeBaseId}
              onSelectedChange={(id, checked) => {
                setSelectedFileIds((prev) => {
                  if (checked) {
                    return [...prev, id];
                  }
                  return prev.filter((item) => item !== id);
                });
              }}
              selected={selectFileIds.includes(item.id)}
              {...item}
            />
          )}
          style={{ flex: 1 }}
        />
      )}
    </Flexbox>
  );
});

export default FileList;
