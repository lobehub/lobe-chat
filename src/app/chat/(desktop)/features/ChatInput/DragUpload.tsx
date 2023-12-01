import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FileImage, FileText, FileUpIcon } from 'lucide-react';
import { rgba } from 'polished';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';

const useStyles = createStyles(({ css, token, stylish }) => {
  return {
    container: css`
      width: 300px;
      height: 300px;
      padding: 16px;

      color: ${token.colorWhite};

      background: ${token.geekblue};
      border-radius: 16px;
      box-shadow:
        ${rgba(token.geekblue, 0.1)} 0 1px 1px 0 inset,
        ${rgba(token.geekblue, 0.1)} 0 50px 100px -20px,
        ${rgba(token.geekblue, 0.3)} 0 30px 60px -30px;
    `,
    content: css`
      width: 100%;
      height: 100%;
      padding: 16px;

      border: 2px dashed ${token.colorWhite};
      border-radius: 12px;
    `,
    desc: css`
      color: ${rgba(token.colorTextLightSolid, 0.6)};
    `,
    title: css`
      font-size: 24px;
      font-weight: bold;
    `,
    wrapper: css`
      position: fixed;
      z-index: 10000000;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      transition: all 0.3s ease-in-out;

      background: ${token.colorBgMask};
      ${stylish.blur};
    `,
  };
});

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const DragUpload = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const [isDragging, setIsDragging] = useState(false);
  // When a file is dragged to a different area, the 'dragleave' event may be triggered,
  // causing isDragging to be mistakenly set to false.
  // to fix this issue, use a counter to ensure the status change only when drag event left the browser window .
  const dragCounter = useRef(0);

  const uploadFile = useFileStore((s) => s.uploadFile);

  const uploadImages = async (fileList: FileList | undefined) => {
    if (!fileList || fileList.length === 0) return;

    const pools = Array.from(fileList).map(async (file) => {
      // skip none-file items
      if (!file.type.startsWith('image')) return;
      await uploadFile(file);
    });

    await Promise.all(pools);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();

    dragCounter.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();

    // reset counter
    dragCounter.current -= 1;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    // reset counter
    dragCounter.current = 0;

    setIsDragging(false);

    // get filesList
    // TODO: support folder files upload
    const files = e.dataTransfer?.files;

    // upload files
    uploadImages(files);
  };

  const handlePaste = (event: ClipboardEvent) => {
    // get files from clipboard

    const files = event.clipboardData?.files;

    uploadImages(files);
  };

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    isDragging && (
      <Center className={styles.wrapper}>
        <div className={styles.container}>
          <Center className={styles.content} gap={40}>
            <Flexbox horizontal>
              <Icon icon={FileImage} size={{ fontSize: 64, strokeWidth: 1 }} />
              <Icon icon={FileUpIcon} size={{ fontSize: 64, strokeWidth: 1 }} />
              <Icon icon={FileText} size={{ fontSize: 64, strokeWidth: 1 }} />
            </Flexbox>
            <Flexbox align={'center'} gap={8} style={{ textAlign: 'center' }}>
              <Flexbox className={styles.title}>{t('upload.dragTitle')}</Flexbox>
              <Flexbox className={styles.desc}>{t('upload.dragDesc')}</Flexbox>
            </Flexbox>
          </Center>
        </div>
      </Center>
    )
  );
});

export default DragUpload;
