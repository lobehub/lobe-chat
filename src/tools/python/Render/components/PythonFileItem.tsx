import { Icon, Image, MaterialFileTypeIcon, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Download, Loader2 } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePlatform } from '@/hooks/usePlatform';
import { fileService } from '@/services/file';
import { useChatStore } from '@/store/chat';
import { PythonFileItem } from '@/types/tool/python';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    overflow: hidden;

    aspect-ratio: auto;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    background: ${token.colorBgContainer};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px ${token.colorFillQuaternary};
    }
  `,
  fileContainer: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginSM}px;
    align-items: center;
    justify-content: center;

    min-height: 120px;
    padding: ${token.paddingLG}px;

    text-align: center;
  `,
  fileName: css`
    max-width: 100%;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorText};
    word-break: break-all;
  `,
  image: css`
    margin-block: 0 !important;
  `,
  loadingOverlay: css`
    position: absolute;
    z-index: 10;
    inset-block-start: 8px;
    inset-inline-end: 8px;

    padding: 4px;
    border-radius: ${token.borderRadiusSM}px;

    background: ${token.colorBgMask};
  `,
}));

interface PythonFileItemProps extends PythonFileItem {
  messageId: string;
}

const PythonFileItemComponent = memo<PythonFileItemProps>(({ fileId, filename, data }) => {
  const { t } = useTranslation('tool');
  const { styles } = useStyles();
  const { isSafari } = usePlatform();
  const [useFetchPythonFileItem] = useChatStore((s) => [s.useFetchPythonFileItem]);

  // 始终调用 Hook，当 fileId 为空时，SWR 将不会发起请求
  const { data: fileData, isLoading } = useFetchPythonFileItem(fileId || '');

  // 判断是否为图片
  const isImage = /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(filename);

  // 处理文件下载
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (fileId) {
      try {
        const { url, name } = await fileService.getFile(fileId);
        const link = document.createElement('a');
        link.href = url;
        link.download = name || filename;
        link.click();
      } catch (error) {
        console.error('Failed to download file:', error);
      }
    } else if (data) {
      // 如果有原始数据，创建 blob URL 下载
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (isImage) {
    // 图片展示
    if (fileId) {
      return (
        <div className={styles.container}>
          <Image
            alt={filename}
            height={isSafari ? 'auto' : '100%'}
            isLoading={isLoading}
            size="100%"
            src={fileData?.url}
            style={{ height: isSafari ? 'auto' : '100%' }}
            wrapperClassName={styles.image}
          />
        </div>
      );
    }

    if (data) {
      // 为临时图片数据创建 blob URL 用于显示
      const blob = new Blob([data]);
      const imageUrl = URL.createObjectURL(blob);
      return (
        <div className={styles.container}>
          <Flexbox style={{ position: 'relative' }}>
            <div className={styles.loadingOverlay}>
              <Tooltip title={t('python.uploading')}>
                <Icon icon={Loader2} size={'small'} spin />
              </Tooltip>
            </div>
            <Image
              alt={filename}
              onLoad={() => URL.revokeObjectURL(imageUrl)} // 加载完成后清理 URL
              size={'100%'}
              src={imageUrl}
            />
          </Flexbox>
        </div>
      );
    }
  }

  // 非图片文件展示
  return (
    <div className={styles.container} onClick={handleDownload}>
      <div className={styles.fileContainer}>
        <MaterialFileTypeIcon filename={filename} size={48} type="file" />
        <div className={styles.fileName}>{filename}</div>
        {!fileId && data && (
          <Tooltip title={t('python.uploading')}>
            <Icon icon={Loader2} size={'small'} spin />
          </Tooltip>
        )}
        <Tooltip title={t('python.downloadFile')}>
          <Icon icon={Download} size={'small'} />
        </Tooltip>
      </div>
    </div>
  );
});

PythonFileItemComponent.displayName = 'PythonFileItem';

export default PythonFileItemComponent;
