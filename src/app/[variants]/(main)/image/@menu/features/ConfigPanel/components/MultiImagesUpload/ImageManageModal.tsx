'use client';

import { Button, Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Upload, X } from 'lucide-react';
import React, { type FC, memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ======== Types ======== //

/**
 * 统一的图片项数据结构
 * - url: 现有图片的远程URL
 * - file: 新选择的文件，需要上传
 * - previewUrl: 本地文件的预览URL（blob URL）
 * 有url的是现有图片，有file的是待上传文件
 */
export interface ImageItem {
  // 现有图片的URL
  file?: File;
  id: string;
  // 新选择的文件
  previewUrl?: string;
  url?: string; // 本地文件的预览URL，仅在file存在时使用
}

interface ImageManageModalProps {
  images: string[];
  // 现有图片URL数组
  onClose: () => void;
  onComplete: (imageItems: ImageItem[]) => void;
  open: boolean; // 统一的完成回调
}

// ======== Utils ======== //

const getFileName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'image.jpg';
  } catch {
    return 'image.jpg';
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// ======== Styles ======== //

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    display: flex;
    height: 480px;
    background: ${token.colorBgContainer};
  `,
  fileName: css`
    margin-block-start: 16px;
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillSecondary};
  `,
  footer: css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-block: 16px;
    padding-inline: 24px;
    border-block-start: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgContainer};
  `,
  modal: css`
    .ant-modal-content {
      overflow: hidden;
      padding: 0;
    }
  `,
  newFileIndicator: css`
    position: absolute;
    z-index: 5;
    inset-block-start: 4px;
    inset-inline-start: 4px;

    padding-block: 2px;
    padding-inline: 6px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 10px;
    font-weight: 500;
    color: ${token.colorWhite};

    background: ${token.colorSuccess};
  `,
  previewArea: css`
    position: relative;

    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 24px;
  `,
  previewEmpty: css`
    font-size: 16px;
    color: ${token.colorTextSecondary};
  `,
  previewImage: css`
    max-width: 100%;
    max-height: 320px;
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: ${token.boxShadowSecondary};
  `,
  sidebar: css`
    overflow-y: auto;

    width: 200px;
    padding: 16px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgLayout};
  `,
  thumbnail: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    width: 100%;
    height: 120px;
    border: 2px solid transparent;
    border-radius: ${token.borderRadius}px;

    transition: border-color 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
    }

    &:hover .thumbnail-delete {
      opacity: 1;
    }

    &.selected {
      border-color: ${token.colorPrimary};
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  thumbnailDelete: css`
    cursor: pointer;

    position: absolute;
    z-index: 10;
    inset-block-start: 4px;
    inset-inline-end: 4px;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;
    border-radius: 50%;

    color: ${token.colorTextLightSolid};

    opacity: 0;
    background: ${token.colorBgMask};

    transition: opacity 0.2s ease;

    &:hover {
      color: ${token.colorError};
      background: ${token.colorErrorBg};
    }
  `,
  thumbnailList: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
}));

// ======== Main Component ======== //

const ImageManageModal: FC<ImageManageModalProps> = memo(
  ({ open, images, onClose, onComplete }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('components');
    const inputRef = useRef<HTMLInputElement>(null);

    // 使用统一的数据结构管理所有图片
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    // Modal 打开时初始化状态
    useEffect(() => {
      if (open) {
        // 将现有URL转换为ImageItem格式
        const initialItems: ImageItem[] = images.map((url) => ({
          id: generateId(),
          url,
        }));
        setImageItems(initialItems);
        setSelectedIndex(0);
      }
    }, [open, images]);

    // Cleanup blob URLs to prevent memory leaks
    useEffect(() => {
      return () => {
        // Cleanup function: revoke all blob URLs when component unmounts or imageItems change
        imageItems.forEach((item) => {
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        });
      };
    }, [imageItems]);

    // Additional cleanup when modal closes
    useEffect(() => {
      if (!open) {
        imageItems.forEach((item) => {
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        });
        setImageItems([]); // Clear items when modal closes
      }
    }, [open]);

    const selectedItem = imageItems[selectedIndex];

    const handleDelete = (index: number) => {
      const itemToDelete = imageItems[index];

      // Clean up blob URL for the deleted item
      if (itemToDelete?.previewUrl) {
        URL.revokeObjectURL(itemToDelete.previewUrl);
      }

      const newItems = imageItems.filter((_, i) => i !== index);
      setImageItems(newItems);

      // 调整选中索引
      if (selectedIndex >= newItems.length) {
        setSelectedIndex(Math.max(0, newItems.length - 1));
      }
    };

    const handleThumbnailDelete = (index: number, event: React.MouseEvent) => {
      event.stopPropagation();
      handleDelete(index);
    };

    const handleUpload = () => {
      inputRef.current?.click();
    };

    const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // 创建新的ImageItem，为每个文件生成一次性的预览URL
      const newItems: ImageItem[] = Array.from(files).map((file) => ({
        file,
        id: generateId(),
        previewUrl: URL.createObjectURL(file), // 只创建一次
      }));

      setImageItems((prev) => [...prev, ...newItems]);
    };

    const handleComplete = () => {
      // 直接传递当前完整状态给父组件处理
      onComplete(imageItems);
      onClose();
    };

    const getDisplayUrl = (item: ImageItem): string => {
      if (item.url) {
        return item.url;
      } else if (item.previewUrl) {
        return item.previewUrl;
      }
      return '';
    };

    const getDisplayFileName = (item: ImageItem): string => {
      if (item.file) {
        return item.file.name;
      } else if (item.url) {
        return getFileName(item.url);
      }
      return '';
    };

    const renderThumbnail = (item: ImageItem, index: number) => {
      const displayUrl = getDisplayUrl(item);
      const isNewFile = Boolean(item.file);

      return (
        <div
          className={`${styles.thumbnail} ${index === selectedIndex ? 'selected' : ''}`}
          key={item.id}
          onClick={() => setSelectedIndex(index)}
        >
          <img
            alt={`Image ${index + 1}`}
            src={displayUrl}
            style={{ height: '100%', objectFit: 'cover', width: '100%' }}
          />

          {/* 新文件标识 */}
          {isNewFile && (
            <div className={styles.newFileIndicator}>
              {t('MultiImagesUpload.modal.newFileIndicator')}
            </div>
          )}

          {/* 删除按钮 */}
          <div
            className={`${styles.thumbnailDelete} thumbnail-delete`}
            onClick={(e) => handleThumbnailDelete(index, e)}
          >
            <X size={12} />
          </div>
        </div>
      );
    };

    return (
      <Modal
        centered
        className={styles.modal}
        footer={null}
        onCancel={onClose}
        open={open}
        title={t('MultiImagesUpload.modal.title', { count: imageItems.length })}
        width={720}
      >
        {/* Hidden file input */}
        <input
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          onClick={(e) => {
            e.currentTarget.value = '';
          }}
          ref={inputRef}
          style={{ display: 'none' }}
          type="file"
        />

        {/* Content */}
        <div className={styles.content}>
          {/* Sidebar - Thumbnail List */}
          <div className={styles.sidebar}>
            <div className={styles.thumbnailList}>{imageItems.map(renderThumbnail)}</div>
          </div>

          {/* Preview Area */}
          <div className={styles.previewArea}>
            {selectedItem ? (
              <>
                <img
                  alt="Preview"
                  className={styles.previewImage}
                  src={getDisplayUrl(selectedItem)}
                />
                <div className={styles.fileName}>{getDisplayFileName(selectedItem)}</div>
              </>
            ) : (
              <div className={styles.previewEmpty}>
                {t('MultiImagesUpload.modal.selectImageToPreview')}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button icon={<Upload size={16} />} onClick={handleUpload} type="default">
            {t('MultiImagesUpload.modal.upload')}
          </Button>

          <Button onClick={handleComplete} type="primary">
            {t('MultiImagesUpload.modal.complete')}
          </Button>
        </div>
      </Modal>
    );
  },
);

ImageManageModal.displayName = 'ImageManageModal';

export default ImageManageModal;
