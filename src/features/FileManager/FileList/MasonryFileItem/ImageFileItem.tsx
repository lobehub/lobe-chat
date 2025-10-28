import { Button, Tooltip } from '@lobehub/ui';
import { Image } from 'antd';
import { createStyles } from 'antd-style';
import { isNull } from 'lodash-es';
import { FileBoxIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FileIcon from '@/components/FileIcon';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { AsyncTaskStatus, IAsyncTaskError } from '@/types/asyncTask';
import { formatSize } from '@/utils/format';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

import ChunksBadge from '../FileListItem/ChunkTag';

const useStyles = createStyles(({ css, token }) => ({
  floatingChunkBadge: css`
    position: absolute;
    z-index: 3;
    inset-block-end: 8px;
    inset-inline-end: 8px;

    border-radius: ${token.borderRadius}px;

    opacity: 0;
    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadow};

    transition: opacity ${token.motionDurationMid};
  `,
  hoverOverlay: css`
    position: absolute;
    z-index: 1;
    inset: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;

    opacity: 0;
    background: ${token.colorBgMask};

    transition: opacity ${token.motionDurationMid};

    &:hover {
      opacity: 1;
    }
  `,
  imagePlaceholder: css`
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 120px;

    background: ${token.colorFillQuaternary};
  `,
  imageWrapper: css`
    position: relative;

    overflow: hidden;

    width: 100%;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorFillQuaternary};

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  `,
  overlaySize: css`
    font-size: 12px;
    color: ${token.colorTextLightSolid};
    opacity: 0.9;
  `,
  overlayTitle: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    max-width: 100%;
    margin-block-end: 8px;

    font-size: 14px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorTextLightSolid};
    text-align: center;
    word-break: break-word;
  `,
}));

interface ImageFileItemProps {
  chunkCount?: number | null;
  chunkingError?: IAsyncTaskError | null;
  chunkingStatus?: AsyncTaskStatus | null;
  embeddingError?: IAsyncTaskError | null;
  embeddingStatus?: AsyncTaskStatus | null;
  fileType?: string;
  finishEmbedding?: boolean;
  id: string;
  isInView: boolean;
  name: string;
  size: number;
  url?: string;
}

const ImageFileItem = memo<ImageFileItemProps>(
  ({
    chunkCount,
    chunkingError,
    chunkingStatus,
    embeddingError,
    embeddingStatus,
    fileType,
    finishEmbedding,
    id,
    isInView,
    name,
    size,
    url,
  }) => {
    const { t } = useTranslation('components');
    const { styles, cx } = useStyles();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isCreatingFileParseTask, parseFiles] = useFileStore((s) => [
      fileManagerSelectors.isCreatingFileParseTask(id)(s),
      s.parseFilesToChunks,
    ]);

    const isSupportedForChunking = !isChunkingUnsupported(fileType || '');

    return (
      <>
        <div className={styles.imageWrapper}>
          {!imageLoaded && (
            <div className={styles.imagePlaceholder}>
              <FileIcon fileName={name} fileType={fileType} size={64} />
            </div>
          )}
          {isInView && url && (
            <Image
              alt={name}
              loading="lazy"
              onError={() => setImageLoaded(false)}
              onLoad={() => setImageLoaded(true)}
              preview={{
                src: url,
              }}
              src={url}
              style={{
                display: 'block',
                height: 'auto',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s',
                width: '100%',
              }}
              wrapperStyle={{
                display: 'block',
                width: '100%',
              }}
            />
          )}
          {/* Hover overlay */}
          <div className={styles.hoverOverlay}>
            <div className={styles.overlayTitle}>{name}</div>
            <div className={styles.overlaySize}>{formatSize(size)}</div>
          </div>
        </div>
        {/* Floating chunk badge or action button */}
        {!isNull(chunkingStatus) && chunkingStatus ? (
          <div
            className={cx('floatingChunkBadge', styles.floatingChunkBadge)}
            onClick={(e) => e.stopPropagation()}
          >
            <ChunksBadge
              chunkCount={chunkCount}
              chunkingError={chunkingError}
              chunkingStatus={chunkingStatus}
              embeddingError={embeddingError}
              embeddingStatus={embeddingStatus}
              finishEmbedding={finishEmbedding}
              id={id}
            />
          </div>
        ) : (
          isSupportedForChunking && (
            <Tooltip title={t('FileManager.actions.chunkingTooltip')}>
              <div
                className={cx('floatingChunkBadge', styles.floatingChunkBadge)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCreatingFileParseTask) {
                    parseFiles([id]);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <Button
                  icon={FileBoxIcon}
                  loading={isCreatingFileParseTask}
                  size={'small'}
                  type={'text'}
                />
              </div>
            </Tooltip>
          )
        )}
      </>
    );
  },
);

export default ImageFileItem;
