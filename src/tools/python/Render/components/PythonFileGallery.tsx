import { ActionIcon, PreviewGroup } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Download } from 'lucide-react';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import GalleyGrid from '@/components/GalleyGrid';
import { fileService } from '@/services/file';
import { PythonFileItem } from '@/types/tool/python';

import PythonFileItemComponent from './PythonFileItem';

interface PythonFileGalleryProps {
  files: PythonFileItem[];
  messageId: string;
}

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: ${token.marginSM}px;
  `,
}));

const PythonFileGallery = memo<PythonFileGalleryProps>(({ files, messageId }) => {
  const { t } = useTranslation('tool');
  const { styles } = useStyles();
  const currentRef = useRef(0);

  const handleDownload = async () => {
    const currentFile = files[currentRef.current];
    if (!currentFile) return;

    // 优先使用永久存储的文件
    if (currentFile.fileId) {
      try {
        const { url, name } = await fileService.getFile(currentFile.fileId);
        const link = document.createElement('a');
        link.href = url;
        link.download = name || currentFile.filename;
        link.click();
      } catch (error) {
        console.error('Failed to download file:', error);
      }
    } else if (currentFile.data) {
      // 如果有原始数据，创建 blob URL 下载
      const blob = new Blob([currentFile.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentFile.filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!files || files.length === 0) {
    return null;
  }

  // 分离图片和其他文件
  const imageFiles = files.filter((file) =>
    /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(file.filename),
  );
  const otherFiles = files.filter(
    (file) => !/\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(file.filename),
  );

  return (
    <Flexbox gap={16}>
      {/* 图片预览组 */}
      {imageFiles.length > 0 && (
        <PreviewGroup
          preview={{
            onChange: (current: number) => {
              currentRef.current = current;
            },
            onVisibleChange: (visible: boolean, _prevVisible: boolean, current: number) => {
              currentRef.current = current;
            },
            toolbarAddon: (
              <ActionIcon
                color={'#fff'}
                icon={Download}
                onClick={handleDownload}
                title={t('python.downloadFile')}
              />
            ),
          }}
        >
          <GalleyGrid
            items={imageFiles.map((file) => ({ ...file, messageId }))}
            renderItem={PythonFileItemComponent}
          />
        </PreviewGroup>
      )}

      {/* 其他文件列表 */}
      {otherFiles.length > 0 && (
        <div className={styles.container}>
          {otherFiles.map((file, index) => (
            <PythonFileItemComponent
              key={`${file.filename}-${index}`}
              {...file}
              messageId={messageId}
            />
          ))}
        </div>
      )}
    </Flexbox>
  );
});

export default PythonFileGallery;
