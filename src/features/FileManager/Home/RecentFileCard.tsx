'use client';

import { FileTypeIcon, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { FileIcon, FileTextIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FileListItem } from '@/types/files';
import { formatSize } from '@lobechat/utils/format';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    padding: 20px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all ${token.motionDurationMid} ${token.motionEaseInOut};

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: ${token.boxShadowTertiary};
    }
  `,
  fileIcon: css`
    flex-shrink: 0;
  `,
  fileName: css`
    overflow: hidden;

    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    color: ${token.colorText};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  fileInfo: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
}));

interface RecentFileCardProps {
  file: FileListItem;
  onClick: () => void;
}

const RecentFileCard = memo<RecentFileCardProps>(({ file, onClick }) => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();

  const isDocument = file.sourceType === 'document';
  const relativeTime = dayjs(file.updatedAt).fromNow();

  return (
    <Flexbox
      align="flex-start"
      className={styles.card}
      gap={12}
      horizontal
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <FileTypeIcon
        className={styles.fileIcon}
        icon={<Icon icon={isDocument ? FileTextIcon : FileIcon} />}
        size={48}
        type={'file'}
      />
      <Flexbox flex={1} gap={4} style={{ minWidth: 0 }}>
        <Text className={styles.fileName} ellipsis={{ tooltip: file.name }}>
          {file.name}
        </Text>
        <Flexbox className={styles.fileInfo} gap={8} horizontal>
          <span>{relativeTime}</span>
          <span>•</span>
          <span>{formatSize(file.size)}</span>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default RecentFileCard;

