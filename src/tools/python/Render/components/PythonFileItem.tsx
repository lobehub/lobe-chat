import { Icon, Image, MaterialFileTypeIcon, Text, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Download } from 'lucide-react';
import React, { memo } from 'react';

import { fileService } from '@/services/file';
import { useChatStore } from '@/store/chat';
import { PythonFileItem } from '@/types/tool/python';

const useImageStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;

    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    background: ${token.colorBgContainer};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px ${token.colorFillQuaternary};
    }
  `,
}));

const useFileStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    display: inline-flex;
    gap: ${token.marginXS}px;
    align-items: center;

    padding-block: ${token.paddingXS}px;
    padding-inline: ${token.paddingSM}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusSM}px;

    font-size: ${token.fontSizeSM}px;
    color: ${token.colorText};

    background: ${token.colorBgContainer};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      background: ${token.colorBgTextHover};
    }
  `,
}));

// 文件显示组件的属性接口
interface FileDisplayProps {
  filename: string;
  onDownload: (e: React.MouseEvent) => void;
}

interface PythonFileItemProps extends PythonFileItem {
  isImage?: boolean;
}

// 图片显示子组件
const ImageDisplay = memo<PythonFileItem>(({ filename, previewUrl, fileId }) => {
  const [useFetchPythonFileItem] = useChatStore((s) => [s.useFetchPythonFileItem]);
  const { data: fileData } = useFetchPythonFileItem(fileId);
  const { styles } = useImageStyles();

  console.log('fileData', fileData);
  console.log('previewUrl', previewUrl);

  let imageUrl = fileData?.url ?? previewUrl;

  if (imageUrl) {
    return (
      <div className={styles.container}>
        <Tooltip title={filename}>
          <Image alt={filename} onLoad={() => URL.revokeObjectURL(imageUrl)} src={imageUrl} />
        </Tooltip>
      </div>
    );
  }

  return null;
});

// 文件显示子组件
const FileDisplay = memo<FileDisplayProps>(({ filename, onDownload }) => {
  const { styles } = useFileStyles();

  return (
    <div className={styles.container} onClick={onDownload}>
      <MaterialFileTypeIcon filename={filename} size={20} type="file" />
      <Text>{filename}</Text>
      <Icon icon={Download} size={'small'} />
    </div>
  );
});

const PythonFileItemComponent = memo<PythonFileItemProps>(
  ({ fileId, filename, previewUrl, isImage }) => {
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
      } else if (previewUrl) {
        // 如果有原始数据，创建 blob URL 下载
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = filename;
        link.click();
      }
    };

    if (isImage) {
      return <ImageDisplay fileId={fileId} filename={filename} previewUrl={previewUrl} />;
    }

    return <FileDisplay filename={filename} onDownload={handleDownload} />;
  },
);

export default PythonFileItemComponent;
