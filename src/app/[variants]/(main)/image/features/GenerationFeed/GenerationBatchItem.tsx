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

import InvalidAPIKey from '@/features/Conversation/Error/InvalidAPIKey';
import { useImageStore } from '@/store/image';
import { StdImageGenParams } from '@/store/image/utils/StandardParameters';
import { AsyncTaskErrorType } from '@/types/asyncTask';
import { GenerationBatch } from '@/types/generation';

import { GenerationItem } from './GenerationItem';

const useStyles = createStyles(({ css, token }) => ({
  batchContainer: css`
    position: relative;

    padding: 16px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
  `,
  batchHeader: css`
    margin-block-end: 12px;
  `,
  prompt: css`
    cursor: pointer;

    margin-block-end: 4px;
    padding: 8px;
    border-radius: ${token.borderRadius}px;

    font-weight: 500;
    line-height: 1.4;
    color: ${token.colorText};
    word-break: break-word;

    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${token.colorFillSecondary};
    }
  `,
  metadata: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  metadataItem: css`
    display: flex;
    gap: 4px;
    align-items: center;
  `,
  batchActions: css`
    display: flex;
    gap: 8px;
    justify-content: flex-start;
    margin-block-start: 12px;
  `,
  imageGrid: css`
    scrollbar-width: none;

    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    width: 100%;

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;

    /* Hide scrollbar for webkit browsers */
    &::-webkit-scrollbar {
      display: none;
    }
  `,
  batchDeleteButton: css`
    &:hover {
      border-color: ${token.colorError} !important;
      color: ${token.colorError} !important;
      background: ${token.colorErrorBg} !important;
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
  const { t: modelProviderT } = useTranslation('modelProvider');
  const { t: errorT } = useTranslation('error');
  const { message } = App.useApp();
  const [imageGridRef] = useAutoAnimate();

  const activeTopicId = useImageStore((s) => s.activeGenerationTopicId);
  const removeGenerationBatch = useImageStore((s) => s.removeGenerationBatch);
  const recreateImage = useImageStore((s) => s.recreateImage);
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

  const handleReuseSettings = () => {
    reuseSettings(batch.model, batch.provider, omit(batch.config as StdImageGenParams, ['seed']));
  };

  const handleDeleteBatch = async () => {
    if (!activeTopicId) return;

    try {
      await removeGenerationBatch(batch.id, activeTopicId);
    } catch (error) {
      console.error('Failed to delete batch:', error);
    }
  };

  if (batch.generations.length === 0) {
    return null;
  }

  const isInvalidApiKey = batch.generations.some(
    (generation) => generation.task.error?.name === AsyncTaskErrorType.InvalidProviderAPIKey,
  );

  if (isInvalidApiKey) {
    return (
      <InvalidAPIKey
        bedrockDescription={modelProviderT('bedrock.unlock.imageGenerationDescription')}
        description={errorT('unlock.apiKey.imageGenerationDescription', {
          name: batch.provider,
        })}
        id={batch.id}
        onClose={() => {
          removeGenerationBatch(batch.id, activeTopicId!);
        }}
        onRecreate={() => {
          recreateImage(batch.id);
        }}
        provider={batch.provider}
      />
    );
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
          onClick={handleReuseSettings}
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
