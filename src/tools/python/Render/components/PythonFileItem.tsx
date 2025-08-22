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

// 图片显示子组件
const PythonImage = memo<PythonFileItem>(({ filename, previewUrl, fileId }) => {
  const [useFetchPythonFileItem] = useChatStore((s) => [s.useFetchPythonFileItem]);
  const { data } = useFetchPythonFileItem(fileId);
  const { styles } = useImageStyles();

  let imageUrl = data?.url ?? previewUrl;

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
const PythonFile = memo<PythonFileItem>(({ filename, fileId, previewUrl }) => {
  const { styles } = useFileStyles();
  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let downloadUrl = previewUrl;
    if (!downloadUrl) {
      const { url } = await fileService.getFile(fileId!);
      downloadUrl = url;
    }
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
  };
  return (
    <div className={styles.container} onClick={onDownload}>
      <MaterialFileTypeIcon filename={filename} size={20} type="file" />
      <Text>{filename}</Text>
      <Icon icon={Download} size={'small'} />
    </div>
  );
});

export { PythonFile, PythonImage };
