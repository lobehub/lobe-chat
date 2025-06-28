'use client';

import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { AlertTriangle, Dices, Download, Loader2, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ImageItem from '@/components/ImageItem';
import { useDownloadImage } from '@/hooks/useDownloadImage';
import { useImageStore } from '@/store/image';
import { imageGenerationConfigSelectors } from '@/store/image/slices/generationConfig/selectors';
import { AsyncTaskStatus } from '@/types/asyncTask';
import { Generation } from '@/types/generation';
import { getFileExtensionFromUrl } from '@/utils/url';

import { ElapsedTime } from './ElapsedTime';
import { calculateImageSize } from './utils';

const useStyles = createStyles(({ css, token }) => ({
  imageContainer: css`
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    border-radius: ${token.borderRadius}px;

    &:hover .generation-action-button {
      opacity: 1;
    }
  `,
  // 图片操作按钮的公共样式
  generationActionButton: css`
    position: absolute;
    inset-inline-end: 8px;

    border: 1px solid ${token.colorBorderSecondary};

    opacity: 0;
    background: ${token.colorBgContainer} !important;
    box-shadow: ${token.boxShadow};

    transition: opacity ${token.motionDurationMid} ${token.motionEaseInOut};

    &:hover {
      background: ${token.colorBgContainer} !important;
    }
  `,
  generationDelete: css`
    inset-block-start: 8px;
  `,
  generationDownload: css`
    inset-block-start: 40px;
  `,
  generationCopySeed: css`
    inset-block-start: 72px;
  `,
  placeholderContainer: css`
    position: relative;

    overflow: hidden;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    background: ${token.colorFillSecondary};

    &:hover .generation-action-button {
      opacity: 1;
    }
  `,
  loadingContent: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  errorContent: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;

    padding: 8px;

    font-size: 12px;
    color: ${token.colorError};
    text-align: center;
  `,
  spinIcon: css`
    color: ${token.colorPrimary};
  `,
  errorIcon: css`
    color: ${token.colorError};
  `,
  errorText: css`
    cursor: pointer;

    margin: 0 !important;

    font-size: 10px;
    color: ${token.colorError} !important;

    opacity: 0.8;

    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  `,
}));

interface GenerationItemProps {
  generation: Generation;
  prompt: string;
}

const isSupportParamSelector = imageGenerationConfigSelectors.isSupportParam;

export const GenerationItem = memo<GenerationItemProps>(({ generation, prompt }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');
  const { message } = App.useApp();
  const useCheckGenerationStatus = useImageStore((s) => s.useCheckGenerationStatus);
  const deleteGeneration = useImageStore((s) => s.removeGeneration);
  const reuseSeed = useImageStore((s) => s.reuseSeed);
  const activeTopicId = useImageStore((s) => s.activeGenerationTopicId);
  const isSupportSeed = useImageStore(isSupportParamSelector('seed'));
  const { downloadImage } = useDownloadImage();

  const isFinalized =
    generation.task.status === AsyncTaskStatus.Success ||
    generation.task.status === AsyncTaskStatus.Error;

  const shouldPoll = !isFinalized;
  useCheckGenerationStatus(generation.id, generation.task.id, activeTopicId!, shouldPoll);

  const imageSize = calculateImageSize(generation);

  const handleDeleteGeneration = async () => {
    try {
      await deleteGeneration(generation.id);
    } catch (error) {
      console.error('Failed to delete generation:', error);
    }
  };

  const handleDownloadImage = async () => {
    if (!generation.asset?.url) return;

    // Generate filename with prompt and timestamp
    const timestamp = dayjs(generation.createdAt).format('YYYY-MM-DD_HH-mm-ss');
    const safePrompt = prompt
      .slice(0, 30)
      .replaceAll(/[^\s\w-]/g, '')
      .trim();

    // Detect file extension from URL
    const fileExtension = getFileExtensionFromUrl(generation.asset.url);
    const fileName = `${safePrompt}_${timestamp}.${fileExtension}`;

    await downloadImage(generation.asset.url, fileName);
  };

  const handleCopySeed = async () => {
    if (!generation.seed) return;

    // If current model supports seed parameter, apply it directly to configuration
    if (isSupportSeed) {
      try {
        reuseSeed(generation.seed);
        message.success(t('generation.actions.seedApplied'));
      } catch (error) {
        console.error('Failed to apply seed:', error);
        message.error(t('generation.actions.seedApplyFailed'));
      }
    } else {
      // If current model doesn't support seed parameter, copy to clipboard
      try {
        await navigator.clipboard.writeText(generation.seed.toString());
        message.success(t('generation.actions.seedCopied'));
      } catch (error) {
        console.error('Failed to copy seed:', error);
        message.error(t('generation.actions.seedCopyFailed'));
      }
    }
  };

  const handleCopyError = async () => {
    if (!generation.task.error) return;

    const errorMessage =
      typeof generation.task.error.body === 'string'
        ? generation.task.error.body
        : generation.task.error.body?.detail || generation.task.error.name || 'Unknown error';

    try {
      await navigator.clipboard.writeText(errorMessage);
      message.success(t('generation.actions.errorCopied'));
    } catch (error) {
      console.error('Failed to copy error message:', error);
      message.error(t('generation.actions.errorCopyFailed'));
    }
  };

  // 如果生成成功且有图片 URL，显示图片
  if (generation.task.status === AsyncTaskStatus.Success && generation.asset?.url) {
    return (
      <div className={styles.imageContainer} style={{ ...imageSize }}>
        <ImageItem
          alt={prompt}
          preview={{
            src: generation.asset.url,
          }}
          style={{ width: '100%', height: '100%' }}
          url={generation.asset.thumbnailUrl}
        />
        <ActionIcon
          className={`${styles.generationActionButton} ${styles.generationDelete} generation-action-button`}
          icon={Trash2}
          onClick={handleDeleteGeneration}
          size={{ blockSize: 24, size: 14 }}
          title={t('generation.actions.delete')}
          tooltipProps={{ placement: 'right' }}
        />
        <ActionIcon
          className={`${styles.generationActionButton} ${styles.generationDownload} generation-action-button`}
          icon={Download}
          onClick={handleDownloadImage}
          size={{ blockSize: 24, size: 14 }}
          title={t('generation.actions.download')}
          tooltipProps={{ placement: 'right' }}
        />
        {generation.seed && (
          <ActionIcon
            className={`${styles.generationActionButton} ${styles.generationCopySeed} generation-action-button`}
            icon={Dices}
            onClick={handleCopySeed}
            size={{ blockSize: 24, size: 14 }}
            title={
              isSupportSeed ? t('generation.actions.applySeed') : t('generation.actions.copySeed')
            }
            tooltipProps={{ placement: 'right' }}
          />
        )}
      </div>
    );
  }

  // 如果生成失败，显示错误状态
  if (generation.task.status === AsyncTaskStatus.Error) {
    return (
      <div className={styles.placeholderContainer} style={{ ...imageSize }}>
        <div className={styles.errorContent}>
          <Icon className={styles.errorIcon} icon={AlertTriangle} size={20} />
          <div>{t('generation.status.failed')}</div>
          {generation.task.error && (
            <Typography.Paragraph
              className={styles.errorText}
              ellipsis={{ rows: 2 }}
              onClick={handleCopyError}
              title={t('generation.actions.copyError')}
            >
              {typeof generation.task.error.body === 'string'
                ? generation.task.error.body
                : generation.task.error.body?.detail ||
                  generation.task.error.name ||
                  'Unknown error'}
            </Typography.Paragraph>
          )}
        </div>
        <ActionIcon
          className={`${styles.generationActionButton} ${styles.generationDelete} generation-action-button`}
          icon={Trash2}
          onClick={handleDeleteGeneration}
          size={{ blockSize: 24, size: 14 }}
          title={t('generation.actions.delete')}
          tooltipProps={{ placement: 'right' }}
        />
      </div>
    );
  }

  // 否则显示 loading 状态（Processing 或 Pending）
  const isGenerating =
    generation.task.status === AsyncTaskStatus.Processing ||
    generation.task.status === AsyncTaskStatus.Pending;

  return (
    <div className={styles.placeholderContainer} style={{ ...imageSize }}>
      <div className={styles.loadingContent}>
        <Icon className={styles.spinIcon} icon={Loader2} size={20} spin />
        <div>{t('generation.status.generating')}</div>
        <ElapsedTime generationId={generation.id} isActive={isGenerating} />
      </div>
      <ActionIcon
        className={`${styles.generationActionButton} ${styles.generationDelete} generation-action-button`}
        icon={Trash2}
        onClick={handleDeleteGeneration}
        size={{ blockSize: 24, size: 14 }}
        title={t('generation.actions.delete')}
        tooltipProps={{ placement: 'right' }}
      />
    </div>
  );
});

GenerationItem.displayName = 'GenerationItem';
