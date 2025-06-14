'use client';

import { ActionIcon, Icon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { AlertTriangle, Dices, Download, Loader2, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ImageItem from '@/components/ImageItem';
import { useImageStore } from '@/store/image';
import { AsyncTaskStatus } from '@/types/asyncTask';
import { Generation } from '@/types/generation';

import { ElapsedTime } from './ElapsedTime';
import { calculateImageSize } from './utils';

const useStyles = createStyles(({ css, token }) => ({
  imageContainer: css`
    position: relative;
    flex-shrink: 0;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;

    &:hover .generation-action-button {
      opacity: 1;
    }
  `,
  // 图片操作按钮的公共样式
  generationActionButton: css`
    position: absolute;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    background: ${token.colorBgContainer} !important;
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadow};

    &:hover {
      background: ${token.colorBgContainer} !important;
    }
  `,
  generationDelete: css`
    top: 8px;
  `,
  generationDownload: css`
    top: 40px;
  `,
  generationCopySeed: css`
    top: 72px;
  `,
  placeholderContainer: css`
    position: relative;
    flex-shrink: 0;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${token.colorFillSecondary};
    border: 1px solid ${token.colorBorder};

    &:hover .generation-action-button {
      opacity: 1;
    }
  `,
  loadingContent: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: ${token.colorTextTertiary};
    font-size: 12px;
  `,
  errorContent: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: ${token.colorError};
    font-size: 12px;
    text-align: center;
    padding: 8px;
  `,
  spinIcon: css`
    color: ${token.colorPrimary};
  `,
  errorIcon: css`
    color: ${token.colorError};
  `,
}));

interface GenerationItemProps {
  generation: Generation;
  prompt: string;
}

export const GenerationItem = memo<GenerationItemProps>(({ generation, prompt }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');
  const { message } = App.useApp();
  const useCheckGenerationStatus = useImageStore((s) => s.useCheckGenerationStatus);
  const deleteGeneration = useImageStore((s) => s.deleteGeneration);
  const activeTopicId = useImageStore((s) => s.activeGenerationTopicId);

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

    try {
      // Use better CORS handling similar to download-image.ts
      const response = await fetch(generation.asset.url, {
        mode: 'cors',
        credentials: 'omit',
        // Avoid image disk cache which can cause incorrect CORS headers
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with prompt and timestamp
      const timestamp = dayjs(generation.createdAt).format('YYYY-MM-DD_HH-mm-ss');
      const safePrompt = prompt
        .slice(0, 30)
        .replaceAll(/[^\s\w-]/g, '')
        .trim();

      // Detect file extension from URL
      const imageUrl = generation.asset.url.toLowerCase();
      const fileExtension = imageUrl.includes('.webp')
        ? 'webp'
        : imageUrl.includes('.jpg') || imageUrl.includes('.jpeg')
          ? 'jpg'
          : 'png';
      link.download = `${safePrompt}_${timestamp}.${fileExtension}`;

      // Trigger download
      document.body.append(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
      message.error(t('generation.actions.downloadFailed'));
    }
  };

  const handleCopySeed = async () => {
    if (!generation.seed) return;

    try {
      await navigator.clipboard.writeText(generation.seed.toString());
      message.success(t('generation.actions.seedCopied'));
    } catch (error) {
      console.error('Failed to copy seed:', error);
      message.error(t('generation.actions.seedCopyFailed'));
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
            title={t('generation.actions.copySeed')}
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
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              {typeof generation.task.error.body === 'string'
                ? generation.task.error.body
                : generation.task.error.body?.detail ||
                  generation.task.error.name ||
                  'Unknown error'}
            </div>
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
