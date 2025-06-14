'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { ModelIcon } from '@lobehub/icons';
import { ActionIcon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { omit } from 'lodash-es';
import { Settings, Trash2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useImageStore } from '@/store/image';
import { StdImageGenParams } from '@/store/image/utils/StandardParameters';
import { GenerationBatch } from '@/types/generation';

import { GenerationItem } from './GenerationItem';

const useStyles = createStyles(({ css, token }) => ({
  batchContainer: css`
    position: relative;
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
  `,
  batchHeader: css`
    margin-bottom: 12px;
  `,
  prompt: css`
    font-weight: 500;
    color: ${token.colorText};
    margin-bottom: 4px;
    word-break: break-word;
    line-height: 1.4;
    cursor: pointer;
    padding: 8px;
    border-radius: ${token.borderRadius}px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${token.colorFillSecondary};
    }
  `,
  metadata: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  `,
  metadataItem: css`
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  batchActions: css`
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-start;
  `,
  imageGrid: css`
    display: flex;
    gap: 8px;
    width: 100%;
    overflow-x: auto;

    /* Hide scrollbar for webkit browsers */
    &::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    scrollbar-width: none;
  `,
  batchDeleteButton: css`
    &:hover {
      background: ${token.colorErrorBg} !important;
      color: ${token.colorError} !important;
      border-color: ${token.colorError} !important;
    }
  `,
}));

// 扩展 dayjs 插件
dayjs.extend(relativeTime);

interface GenerationBatchItemProps {
  batch: GenerationBatch;
}

export const GenerationBatchItem = memo<GenerationBatchItemProps>(({ batch }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');
  const { message } = App.useApp();
  const [imageGridRef] = useAutoAnimate();

  const activeTopicId = useImageStore((s) => s.activeGenerationTopicId);
  const deleteGenerationBatch = useImageStore((s) => s.deleteGenerationBatch);
  const reuseSettings = useImageStore((s) => s.reuseSettings);

  const timeAgo = useMemo(() => {
    return dayjs(batch.createdAt).fromNow();
  }, [batch.createdAt]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(batch.prompt);
      message.success(t('generation.actions.promptCopied'));
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      message.error(t('generation.actions.promptCopyFailed'));
    }
  };

  const handleBatchSettings = () => {
    reuseSettings(omit(batch.config as StdImageGenParams, ['seed']));
  };

  const handleDeleteBatch = async () => {
    if (!activeTopicId) return;

    try {
      await deleteGenerationBatch(batch.id, activeTopicId);
    } catch (error) {
      console.error('Failed to delete batch:', error);
    }
  };

  if (batch.generations.length === 0) {
    return null;
  }

  return (
    <div className={styles.batchContainer}>
      <div className={styles.batchHeader}>
        <div className={styles.prompt} onClick={handleCopyPrompt}>
          {batch.prompt}
        </div>
        <div className={styles.metadata}>
          <span className={styles.metadataItem}>
            <ModelIcon model={batch.model} size={16} />
            <span>{batch.model}</span>
          </span>
          {batch.width && batch.height && (
            <span className={styles.metadataItem}>
              <span>
                {batch.width} × {batch.height}
              </span>
            </span>
          )}
          <span className={styles.metadataItem}>
            <span>{timeAgo}</span>
          </span>
          <span className={styles.metadataItem}>
            <span>{t('generation.metadata.count', { count: batch.generations.length })}</span>
          </span>
        </div>
      </div>

      <div className={styles.imageGrid} ref={imageGridRef}>
        {batch.generations.map((generation) => (
          <GenerationItem generation={generation} key={generation.id} prompt={batch.prompt} />
        ))}
      </div>

      <div className={styles.batchActions}>
        <ActionIcon
          icon={Settings}
          onClick={handleBatchSettings}
          size={{ blockSize: 32, size: 16 }}
          title={t('generation.actions.reuseSettings')}
        />
        <ActionIcon
          className={styles.batchDeleteButton}
          icon={Trash2}
          onClick={handleDeleteBatch}
          size={{ blockSize: 32, size: 16 }}
          title={t('generation.actions.deleteBatch')}
        />
      </div>
    </div>
  );
});

GenerationBatchItem.displayName = 'GenerationBatchItem';
