import { Button, Markdown, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { isNull } from 'lodash-es';
import { FileBoxIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FileIcon from '@/components/FileIcon';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { AsyncTaskStatus, IAsyncTaskError } from '@/types/asyncTask';
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
  iconWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;

    height: 120px;
    margin-block-end: 12px;
    border-radius: ${token.borderRadius}px;

    background: ${token.colorFillQuaternary};
  `,
  markdownLoading: css`
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 120px;
    border-radius: ${token.borderRadiusLG}px;

    font-size: 12px;
    color: ${token.colorTextTertiary};

    background: ${token.colorFillQuaternary};
  `,
  markdownPreview: css`
    position: relative;

    overflow: hidden;

    width: 100%;
    min-height: 120px;
    max-height: 300px;
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;

    font-size: 13px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
    word-wrap: break-word;
    white-space: pre-wrap;

    background: ${token.colorFillQuaternary};

    /* Style for rendered markdown */
    article {
      font-size: 13px;
      line-height: 1.6;

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-block-start: 8px;
        margin-block-end: 4px;
        font-size: 14px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }

      p {
        margin-block-end: 8px;
      }

      ul,
      ol {
        margin-block-end: 8px;
        padding-inline-start: 20px;
      }

      code {
        padding: 2px 4px;
        border-radius: 3px;
        background: ${token.colorFillTertiary};
        font-size: 12px;
      }

      pre {
        margin-block-end: 8px;
        padding: 8px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillTertiary};
      }
    }

    &::after {
      pointer-events: none;
      content: '';

      position: absolute;
      inset-block-end: 0;
      inset-inline: 0;

      height: 60px;

      background: linear-gradient(to bottom, transparent, ${token.colorFillQuaternary});
    }
  `,
}));

interface NoteFileItemProps {
  chunkCount?: number | null;
  chunkingError?: IAsyncTaskError | null;
  chunkingStatus?: AsyncTaskStatus | null;
  embeddingError?: IAsyncTaskError | null;
  embeddingStatus?: AsyncTaskStatus | null;
  fileType?: string;
  finishEmbedding?: boolean;
  id: string;
  isLoadingMarkdown: boolean;
  markdownContent: string;
  name: string;
}

const NoteFileItem = memo<NoteFileItemProps>(
  ({
    chunkCount,
    chunkingError,
    chunkingStatus,
    embeddingError,
    embeddingStatus,
    fileType,
    finishEmbedding,
    id,
    isLoadingMarkdown,
    markdownContent,
    name,
  }) => {
    const { t } = useTranslation('components');
    const { styles, cx } = useStyles();
    const [isCreatingFileParseTask, parseFiles] = useFileStore((s) => [
      fileManagerSelectors.isCreatingFileParseTask(id)(s),
      s.parseFilesToChunks,
    ]);

    const isSupportedForChunking = !isChunkingUnsupported(fileType || '');

    return (
      <>
        <div style={{ position: 'relative' }}>
          {isLoadingMarkdown ? (
            <div className={styles.markdownLoading}>Loading preview...</div>
          ) : markdownContent ? (
            <div className={styles.markdownPreview}>
              <Markdown fontSize={12} headerMultiple={0.15} marginMultiple={0.5}>
                {markdownContent}
              </Markdown>
            </div>
          ) : (
            <div className={styles.iconWrapper}>
              <FileIcon fileName={name} fileType={fileType} size={64} />
            </div>
          )}
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

export default NoteFileItem;
