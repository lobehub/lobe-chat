import { Icon, Tooltip } from '@lobehub/ui';
import { Badge, Button, Tag } from 'antd';
import { createStyles } from 'antd-style';
import { BoltIcon, Loader2Icon, RotateCwIcon } from 'lucide-react';
import { darken, lighten } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { AsyncTaskStatus, FileParsingTask } from '@/types/asyncTask';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  errorReason: css`
    padding: 4px;

    font-family: monospace;
    font-size: 12px;

    background: ${isDarkMode ? darken(0.1, token.colorText) : lighten(0.1, token.colorText)};
    border-radius: 4px;
  `,
}));

interface FileParsingStatusProps extends FileParsingTask {
  className?: string;
  hideEmbeddingButton?: boolean;
  onClick?: (status: AsyncTaskStatus) => void;
  onEmbeddingClick?: () => void;
  onErrorClick?: (task: 'chunking' | 'embedding') => void;
  preparingEmbedding?: boolean;
}

const FileParsingStatus = memo<FileParsingStatusProps>(
  ({
    chunkingStatus,
    onEmbeddingClick,
    chunkingError,
    finishEmbedding,
    chunkCount,
    embeddingStatus,
    embeddingError,
    onClick,
    preparingEmbedding,
    onErrorClick,
    className,
    hideEmbeddingButton,
  }) => {
    const { t } = useTranslation(['components', 'common']);
    const { styles, cx } = useStyles();

    switch (chunkingStatus) {
      case AsyncTaskStatus.Processing: {
        return (
          <Tooltip
            overlayStyle={{ pointerEvents: 'none' }}
            title={t('FileParsingStatus.chunks.status.processingTip')}
          >
            <Tag
              bordered={false}
              className={className}
              color={'processing'}
              icon={<Badge status={'processing'} />}
              style={{ display: 'flex', gap: 4 }}
            >
              {t('FileParsingStatus.chunks.status.processing')}
            </Tag>
          </Tooltip>
        );
      }

      case AsyncTaskStatus.Error: {
        return (
          <Tooltip
            overlayStyle={{ maxWidth: 340, pointerEvents: 'none' }}
            // style={{}}
            title={
              <Flexbox gap={4}>
                {t('FileParsingStatus.chunks.status.errorResult')}
                {chunkingError && (
                  <Flexbox className={styles.errorReason}>
                    [{chunkingError.name}]:{' '}
                    {chunkingError.body && typeof chunkingError.body !== 'string'
                      ? chunkingError.body.detail
                      : chunkingError.body}
                  </Flexbox>
                )}
              </Flexbox>
            }
          >
            <Tag bordered={false} className={className} color={'error'}>
              {t('FileParsingStatus.chunks.status.error')}{' '}
              <Icon
                icon={RotateCwIcon}
                onClick={() => {
                  onErrorClick?.('chunking');
                }}
                style={{ cursor: 'pointer' }}
                title={t('retry', { ns: 'common' })}
              />
            </Tag>
          </Tooltip>
        );
      }

      case AsyncTaskStatus.Success: {
        const isEmbeddingProcessing = embeddingStatus === AsyncTaskStatus.Processing;

        switch (embeddingStatus) {
          case AsyncTaskStatus.Processing: {
            return (
              <Flexbox horizontal>
                <Tooltip
                  overlayStyle={{ pointerEvents: 'none' }}
                  title={t('FileParsingStatus.chunks.embeddingStatus.processing')}
                >
                  <Tag
                    bordered={false}
                    className={cx('chunk-tag', className)}
                    color={'processing'}
                    icon={
                      preparingEmbedding ? (
                        <Icon icon={Loader2Icon} spin />
                      ) : (
                        <Icon icon={BoltIcon} spin={isEmbeddingProcessing} />
                      )
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {chunkCount}
                  </Tag>
                </Tooltip>
              </Flexbox>
            );
          }

          case AsyncTaskStatus.Error: {
            return (
              <Tooltip
                overlayStyle={{ maxWidth: 340, pointerEvents: 'none' }}
                title={
                  <Flexbox gap={4}>
                    {t('FileParsingStatus.chunks.embeddingStatus.errorResult')}
                    {embeddingError && (
                      <Flexbox className={styles.errorReason}>
                        [{embeddingError.name}]:{' '}
                        {embeddingError.body && typeof embeddingError.body !== 'string'
                          ? embeddingError.body.detail
                          : embeddingError.body}
                      </Flexbox>
                    )}
                  </Flexbox>
                }
              >
                <Tag bordered={false} className={className} color={'error'}>
                  {t('FileParsingStatus.chunks.embeddingStatus.error')}{' '}
                  <Icon
                    icon={RotateCwIcon}
                    onClick={() => {
                      onErrorClick?.('embedding');
                    }}
                    style={{ cursor: 'pointer' }}
                    title={t('retry', { ns: 'common' })}
                  />
                </Tag>
              </Tooltip>
            );
          }
        }

        return (
          <Flexbox horizontal>
            <Tooltip
              overlayStyle={{ pointerEvents: 'none' }}
              title={
                finishEmbedding
                  ? t('FileParsingStatus.chunks.embeddingStatus.success')
                  : t('FileParsingStatus.chunks.embeddingStatus.empty')
              }
            >
              <Tag
                bordered={false}
                className={cx('chunk-tag', className)}
                color={finishEmbedding ? 'purple' : undefined}
                icon={
                  preparingEmbedding ? (
                    <Icon icon={Loader2Icon} spin />
                  ) : (
                    <Icon icon={BoltIcon} spin={isEmbeddingProcessing} />
                  )
                }
                onClick={() => {
                  onClick?.(AsyncTaskStatus.Success);
                }}
                style={{ cursor: 'pointer' }}
              >
                {chunkCount}
                {
                  // if want to hide button
                  hideEmbeddingButton ||
                  // or if finished the embedding
                  finishEmbedding ||
                  // or if preparing the embedding
                  preparingEmbedding ? null : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEmbeddingClick?.();
                      }}
                      style={{
                        fontSize: 12,
                        height: 'auto',
                        paddingBlock: 0,
                        paddingInline: '8px 0',
                      }}
                      type={'link'}
                    >
                      {t('FileParsingStatus.chunks.embeddings')}
                    </Button>
                  )
                }
              </Tag>
            </Tooltip>
          </Flexbox>
        );
      }
    }
  },
);

export default FileParsingStatus;
