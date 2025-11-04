'use client';

import { Image as LobeImage, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { FileListItem } from '@/types/files';
import { formatSize } from '@lobechat/utils/format';

const IMAGE_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    cursor: pointer;

    position: relative;
    flex-shrink: 0;

    overflow: hidden;

    width: 280px;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all ${token.motionDurationMid};

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: ${token.boxShadowTertiary};
    }
  `,
  imagePreview: css`
    width: 100%;
    height: 160px;
    margin-block-end: 12px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgLayout};
    object-fit: cover;
  `,
  iconWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    margin-block-end: 12px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgLayout};
  `,
  noteIcon: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    height: 160px;
    margin-block-end: 12px;
    padding: 16px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgLayout};
  `,
  emoji: css`
    font-size: 48px;
    line-height: 1;
  `,
  title: css`
    margin: 0 !important;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  `,
  info: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
}));

interface RecentFileCardProps {
  file: FileListItem;
  onClick: () => void;
}

const RecentFileCard = memo<RecentFileCardProps>(({ file, onClick }) => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();

  const isImage = IMAGE_FILE_TYPES.includes(file.fileType);
  const isDocument = file.sourceType === 'document';
  const emoji = file.metadata?.emoji;
  const relativeTime = dayjs(file.updatedAt).fromNow();

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <Flexbox gap={12} style={{ position: 'relative' }}>
        {/* Preview or Icon */}
        {isImage && file.url ? (
          <LobeImage
            alt={file.name}
            className={styles.imagePreview}
            preview={false}
            src={file.url}
          />
        ) : isDocument && emoji ? (
          <div className={styles.noteIcon}>
            <div className={styles.emoji}>{emoji}</div>
          </div>
        ) : (
          <div className={styles.iconWrapper}>
            <FileIcon fileName={file.name} fileType={file.fileType} size={48} />
          </div>
        )}

        {/* File Info */}
        <Flexbox gap={6} style={{ overflow: 'hidden', position: 'relative' }}>
          <Text className={styles.title} ellipsis={{ rows: 2 }}>
            {file.name}
          </Text>
          <Flexbox className={styles.info} gap={8} horizontal>
            <span>{relativeTime}</span>
            <span>•</span>
            <span>{formatSize(file.size)}</span>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </div>
  );
});

export default RecentFileCard;

