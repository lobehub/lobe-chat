'use client';

import { createStyles, useTheme } from 'antd-style';
import { Image as ImageIcon, X } from 'lucide-react';
import React, { type FC, memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { FileUploadStatus } from '@/types/files/upload';

// ======== Business Types ======== //

export interface ImageUploadProps {
  // Callback when URL changes
  className?: string; // Image URL
  onChange?: (url?: string) => void;
  style?: React.CSSProperties;
  value?: string | null;
}

/**
 * Internal type for managing upload state
 */
interface UploadState {
  error?: string; // Upload progress (0-100)
  previewUrl: string;
  progress: number;
  // Local blob URL for preview
  status: FileUploadStatus;
}

// ======== Styles ======== //

const useStyles = createStyles(({ css, token }) => {
  return {
    changeButton: css`
      cursor: pointer;

      padding-block: 8px;
      padding-inline: 16px;
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadius}px;

      font-size: 12px;
      font-weight: 500;
      color: ${token.colorText};

      background: ${token.colorBgContainer};
      box-shadow: ${token.boxShadowSecondary};

      &:hover {
        border-color: ${token.colorPrimary};
        color: ${token.colorPrimary};
        background: ${token.colorBgElevated};
      }
    `,
    changeOverlay: css`
      position: absolute;
      z-index: 5;
      inset: 0;

      display: flex;
      align-items: center;
      justify-content: center;

      opacity: 0;
      background: ${token.colorBgMask};

      transition: opacity ${token.motionDurationMid} ease;
    `,
    container: css`
      width: 100%;
    `,
    deleteIcon: css`
      cursor: pointer;

      position: absolute;
      z-index: 10;
      inset-block-start: 8px;
      inset-inline-end: 8px;

      display: flex;
      align-items: center;
      justify-content: center;

      width: 24px;
      height: 24px;
      border-radius: 50%;

      color: ${token.colorTextLightSolid};

      opacity: 0;
      background: ${token.colorBgMask};

      transition: opacity ${token.motionDurationMid} ease;

      &:hover {
        color: ${token.colorError};
        background: ${token.colorErrorBg};
      }
    `,
    imageStyle: css`
      width: 100%;
      height: 100%;
      object-fit: cover;
    `,
    placeholder: css`
      cursor: pointer;

      width: 100%;
      height: 160px;
      border: 2px dashed ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;

      background: ${token.colorFillAlter};

      transition: all ${token.motionDurationMid} ease;

      &:hover {
        border-color: ${token.colorPrimary};
        background: ${token.colorFillSecondary};
      }
    `,
    placeholderIcon: css`
      color: ${token.colorTextTertiary};
    `,
    placeholderText: css`
      font-size: 12px;
      line-height: 1.4;
      color: ${token.colorTextSecondary};
      text-align: center;
    `,
    successDisplay: css`
      cursor: pointer;

      position: relative;

      overflow: hidden;

      width: 100%;
      height: 160px;
      border-radius: ${token.borderRadiusLG}px;

      background: ${token.colorBgContainer};

      &:hover .change-overlay {
        opacity: 1;
      }

      &:hover .delete-icon {
        opacity: 1;
      }
    `,
    uploadingDisplay: css`
      position: relative;

      overflow: hidden;

      width: 100%;
      height: 160px;
      border: 2px solid ${token.colorPrimary};
      border-radius: ${token.borderRadiusLG}px;

      background: ${token.colorFillSecondary};
    `,
    uploadingOverlay: css`
      position: absolute;
      z-index: 5;
      inset: 0;

      display: flex;
      align-items: center;
      justify-content: center;

      background: ${token.colorBgMask};
    `,
  };
});

// ======== Utils ======== //

/**
 * Check if a URL is a local blob URL
 */
const isLocalBlobUrl = (url: string): boolean => url.startsWith('blob:');

// ======== Sub-Components ======== //

/**
 * 圆形进度条组件 (复用自 MultiImagesUpload)
 */
interface CircularProgressProps {
  showText?: boolean; // 0-100
  size?: number;
  strokeWidth?: number;
  value: number;
}

const CircularProgress: FC<CircularProgressProps> = memo(
  ({ value, size = 60, strokeWidth = 6, showText = true }) => {
    const theme = useTheme();

    // Ensure value is between 0 and 100
    const progress = Math.min(100, Math.max(0, value));

    // Calculate circle properties
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          height: size,
          justifyContent: 'center',
          position: 'relative',
          width: size,
        }}
      >
        {/* Background circle */}
        <svg
          height={size}
          style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
          width={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={theme.colorBorder}
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Progress circle */}
        <svg
          height={size}
          style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
          width={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={theme.colorPrimary}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            style={{
              transition: 'stroke-dashoffset 0.2s ease-in-out',
            }}
          />
        </svg>

        {/* Progress text */}
        {showText && (
          <span
            style={{
              color: theme.colorPrimary,
              fontSize: '12px',
              fontWeight: 600,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {Math.round(progress)}%
          </span>
        )}
      </div>
    );
  },
);

CircularProgress.displayName = 'CircularProgress';

/**
 * 占位视图组件
 */
interface PlaceholderProps {
  onClick?: () => void;
}

const Placeholder: FC<PlaceholderProps> = memo(({ onClick }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('components');

  return (
    <Center className={styles.placeholder} gap={16} horizontal={false} onClick={onClick}>
      <ImageIcon className={styles.placeholderIcon} size={48} strokeWidth={1.5} />
      <div className={styles.placeholderText}>
        {t('ImageUpload.placeholder.primary', 'Add Image')}
        <br />
        {t('ImageUpload.placeholder.secondary', 'Click to upload')}
      </div>
    </Center>
  );
});

Placeholder.displayName = 'Placeholder';

/**
 * 上传中视图组件
 */
interface UploadingDisplayProps {
  previewUrl: string;
  progress: number;
}

const UploadingDisplay: FC<UploadingDisplayProps> = memo(({ previewUrl, progress }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.uploadingDisplay}>
      <img alt="Uploading preview" className={styles.imageStyle} src={previewUrl} />
      <div className={styles.uploadingOverlay}>
        <CircularProgress value={progress} />
      </div>
    </div>
  );
});

UploadingDisplay.displayName = 'UploadingDisplay';

/**
 * 成功视图组件
 */
interface SuccessDisplayProps {
  imageUrl: string;
  onChangeImage?: () => void;
  onDelete?: () => void;
}

const SuccessDisplay: FC<SuccessDisplayProps> = memo(({ imageUrl, onDelete, onChangeImage }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('components');

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete?.();
  };

  const handleChangeImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChangeImage?.();
  };

  return (
    <div className={styles.successDisplay} onClick={onChangeImage}>
      <img alt="Uploaded image" className={styles.imageStyle} src={imageUrl} />

      {/* Delete button */}
      <div className={`${styles.deleteIcon} delete-icon`} onClick={handleDelete}>
        <X size={14} />
      </div>

      {/* Change image overlay */}
      <div className={`${styles.changeOverlay} change-overlay`} onClick={handleChangeImage}>
        <button className={styles.changeButton} type="button">
          {t('ImageUpload.actions.changeImage', 'Click to change image')}
        </button>
      </div>
    </div>
  );
});

SuccessDisplay.displayName = 'SuccessDisplay';

// ======== Main Component ======== //

const ImageUpload: FC<ImageUploadProps> = memo(({ value, onChange, style, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadWithProgress = useFileStore((s) => s.uploadWithProgress);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (uploadState?.previewUrl && isLocalBlobUrl(uploadState.previewUrl)) {
        URL.revokeObjectURL(uploadState.previewUrl);
      }
    };
  }, [uploadState?.previewUrl]);

  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Set initial upload state
    setUploadState({
      previewUrl,
      progress: 0,
      status: 'pending',
    });

    try {
      // Start upload
      const result = await uploadWithProgress({
        file,
        onStatusUpdate: (updateData) => {
          if (updateData.type === 'updateFile') {
            setUploadState((prev) => {
              if (!prev) return null;

              const fileStatus = updateData.value.status;
              if (!fileStatus) return prev;

              return {
                ...prev,
                error: fileStatus === 'error' ? 'Upload failed' : undefined,
                progress: updateData.value.uploadState?.progress || 0,
                status: fileStatus,
              };
            });
          } else if (updateData.type === 'removeFile') {
            // Handle file removal
            setUploadState(null);
          }
        },
        skipCheckFileType: true,
      });

      if (result?.url) {
        // Upload successful
        onChange?.(result.url);
      }
    } catch {
      // Upload failed
      setUploadState((prev) =>
        prev
          ? {
              ...prev,
              error: 'Upload failed',
              status: 'error',
            }
          : null,
      );
    } finally {
      // Cleanup
      if (isLocalBlobUrl(previewUrl)) {
        URL.revokeObjectURL(previewUrl);
      }

      // Clear upload state after a delay to show completion
      setTimeout(() => {
        setUploadState(null);
      }, 1000);
    }
  };

  const handleDelete = () => {
    onChange?.(undefined);
  };

  // Determine which view to render
  const hasImage = Boolean(value);
  const isUploading = Boolean(uploadState);

  return (
    <div className={className} style={style}>
      {/* Hidden file input */}
      <input
        accept="image/*"
        onChange={handleFileChange}
        onClick={(e) => {
          // Reset value to allow re-selecting the same file
          e.currentTarget.value = '';
        }}
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
      />

      {/* Conditional rendering based on state */}
      {isUploading && uploadState ? (
        <UploadingDisplay previewUrl={uploadState.previewUrl} progress={uploadState.progress} />
      ) : hasImage ? (
        <SuccessDisplay
          imageUrl={value!}
          onChangeImage={handleFileSelect}
          onDelete={handleDelete}
        />
      ) : (
        <Placeholder onClick={handleFileSelect} />
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
