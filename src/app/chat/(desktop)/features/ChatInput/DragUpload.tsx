import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FileImage, FileText, FileUpIcon } from 'lucide-react';
import { rgba } from 'polished';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => {
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

      background: ${rgba('#000', 0.8)};
    `,
  };
});

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const DragUpload = () => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const [isDragging, setIsDragging] = useState(false);
  // When a file is dragged to a different area, the 'dragleave' event may be triggered,
  // causing isDragging to be mistakenly set to false.
  // to fix this issue, use a counter to ensure the status change only when drag event left the browser window .
  const dragCounter = useRef(0);

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

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    // reset counter
    dragCounter.current = 0;

    setIsDragging(false);

    // 获取拖拽的文件列表
    const files = e.dataTransfer?.files;

    if (files && files.length > 0) {
      // 这里可以添加上传文件的逻辑
      console.log('Dropped files:', files);
    }
  };

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
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
};

export default DragUpload;
