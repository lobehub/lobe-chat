'use client';

import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { VList } from 'virtua';

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
  ({ data, onSelectionChange, pendingRenameItemId, selectFileIds }) => {
    const { t } = useTranslation('components');
    const { styles } = useStyles();

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
        <VList bufferSize={400} data={data} itemSize={48} style={{ height: '100%' }}>
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
