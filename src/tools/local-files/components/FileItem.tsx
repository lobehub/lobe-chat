import { LocalFileItem } from '@lobechat/electron-client-ipc';
import { ActionIcon, FileTypeIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { FolderOpen } from 'lucide-react';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { localFileService } from '@/services/electron/localFileService';
import { formatSize } from '@/utils/format';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    border-radius: 4px;
    color: ${token.colorTextSecondary};

    :hover {
      color: ${token.colorText};
      background: ${token.colorFillTertiary};
    }
  `,
  path: css`
    overflow: hidden;

    font-size: 10px;
    line-height: 1;
    color: ${token.colorTextDescription};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  size: css`
    min-width: 50px;

    font-family: ${token.fontFamilyCode};
    font-size: 10px;
    color: ${token.colorTextTertiary};
    text-align: end;
  `,
  title: css`
    overflow: hidden;
    display: block;

    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface FileItemProps extends LocalFileItem {
  showTime?: boolean;
}
const FileItem = memo<FileItemProps>(
  ({ isDirectory, name, path, size, type, showTime = false, createdTime }) => {
    const { t } = useTranslation('tool');
    const { styles } = useStyles();
    const [isHovering, setIsHovering] = useState(false);

    return (
      <Flexbox
        align={'center'}
        className={styles.container}
        gap={12}
        horizontal
        onClick={() => {
          if (isDirectory) {
            localFileService.openLocalFolder({ isDirectory, path });
          } else {
            localFileService.openLocalFile({ path });
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        padding={'2px 8px'}
        style={{ cursor: 'pointer', fontSize: 12, width: '100%' }}
      >
        {isDirectory ? (
          <FileTypeIcon size={16} type={'folder'} variant={'mono'} />
        ) : (
          <FileIcon fileName={name} fileType={type} size={16} variant={'pure'} />
        )}
        <Flexbox
          align={'baseline'}
          gap={4}
          horizontal
          style={{ overflow: 'hidden', width: '100%' }}
        >
          <div className={styles.title}>{name}</div>
          {showTime ? (
            <div className={styles.path}>{dayjs(createdTime).format('MMM DD hh:mm')}</div>
          ) : (
            <div className={styles.path}>{path}</div>
          )}
        </Flexbox>
        {isHovering ? (
          <Flexbox direction={'horizontal-reverse'} gap={8} style={{ minWidth: 50 }}>
            <ActionIcon
              icon={FolderOpen}
              onClick={(e) => {
                e.stopPropagation();
                localFileService.openLocalFolder({ isDirectory, path });
              }}
              size={'small'}
              style={{ height: 16, width: 16 }}
              title={t('localFiles.openFolder')}
            />
          </Flexbox>
        ) : (
          <span className={styles.size}>{formatSize(size)}</span>
        )}
      </Flexbox>
    );
  },
);

export default FileItem;
