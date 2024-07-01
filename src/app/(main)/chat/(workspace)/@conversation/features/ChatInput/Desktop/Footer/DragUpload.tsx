import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FileImage, FileText, FileUpIcon } from 'lucide-react';
import { darken, lighten } from 'polished';
import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useFileStore } from '@/store/file';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

const DRAGGING_ROOT_ID = 'dragging-root';
const getContainer = () => document.querySelector(`#${DRAGGING_ROOT_ID}`);
const BLOCK_SIZE = 64;
const ICON_SIZE = 36;

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      width: 320px;
      height: 200px;
      padding: ${token.borderRadiusLG + 4}px;

      background: ${token.geekblue};
      border-radius: 16px;
    `,
    content: css`
      width: 100%;
      height: 100%;
      padding: 16px;

      border: 1.5px dashed ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;
    `,
    desc: css`
      color: #fff;
    `,
    icon: css`
      color: ${darken(0.05, token.geekblue)};
      background: ${lighten(0.38, token.geekblue)};
      border-radius: ${token.borderRadiusLG}px;
    `,
    iconGroup: css`
      margin-block-start: -44px;
    `,
    title: css`
      font-size: 20px;
      font-weight: bold;
      color: #fff;
    `,
    wrapper: css`
      position: fixed;
      z-index: 9999;
      inset: 0;

      width: 100%;
      height: 100%;

      background: ${token.colorBgMask};
      backdrop-filter: blur(4px);

      transition: all 0.3s ease-in-out;
    `,
  };
});

const handleDragOver = (e: DragEvent) => {
  if (!e.dataTransfer?.items || e.dataTransfer.items.length === 0) return;

  const isFile = e.dataTransfer.types.includes('Files');
  if (isFile) {
    e.preventDefault();
  }
};

const DragUpload = memo(() => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('chat');
  const [isDragging, setIsDragging] = useState(false);
  // When a file is dragged to a different area, the 'dragleave' event may be triggered,
  // causing isDragging to be mistakenly set to false.
  // to fix this issue, use a counter to ensure the status change only when drag event left the browser window .
  const dragCounter = useRef(0);

  const uploadFile = useFileStore((s) => s.uploadFile);

  const model = useAgentStore(agentSelectors.currentAgentModel);

  const enabledFiles = useUserStore(modelProviderSelectors.isModelEnabledFiles(model));

  const uploadImages = async (fileList: FileList | undefined) => {
    if (!fileList || fileList.length === 0) return;

    const pools = Array.from(fileList).map(async (file) => {
      // skip none-file items
      if (!file.type.startsWith('image') && !enabledFiles) return;
      await uploadFile(file);
    });

    await Promise.all(pools);
  };

  const handleDragEnter = (e: DragEvent) => {
    if (!e.dataTransfer?.items || e.dataTransfer.items.length === 0) return;

    const isFile = e.dataTransfer.types.includes('Files');
    if (isFile) {
      dragCounter.current += 1;
      e.preventDefault();
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    if (!e.dataTransfer?.items || e.dataTransfer.items.length === 0) return;

    const isFile = e.dataTransfer.types.includes('Files');
    if (isFile) {
      e.preventDefault();

      // reset counter
      dragCounter.current -= 1;

      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    }
  };

  const handleDrop = async (e: DragEvent) => {
    if (!e.dataTransfer?.items || e.dataTransfer.items.length === 0) return;

    const isFile = e.dataTransfer.types.includes('Files');
    if (isFile) {
      e.preventDefault();

      // reset counter
      dragCounter.current = 0;

      setIsDragging(false);

      // get filesList
      // TODO: support folder files upload
      const files = e.dataTransfer?.files;

      // upload files
      uploadImages(files);
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    // get files from clipboard
    const files = event.clipboardData?.files;

    uploadImages(files);
  };

  useEffect(() => {
    if (getContainer()) return;
    const root = document.createElement('div');
    root.id = DRAGGING_ROOT_ID;
    document.body.append(root);

    return () => {
      root.remove();
    };
  }, []);

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
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handlePaste]);

  if (!isDragging) return;

  return createPortal(
    <Center className={styles.wrapper}>
      <div className={styles.container}>
        <Center className={styles.content} gap={12}>
          <Flexbox className={styles.iconGroup} horizontal>
            <Center
              className={styles.icon}
              height={BLOCK_SIZE * 1.25}
              style={{
                background: lighten(0.32, theme.geekblue),
                transform: 'rotateZ(-20deg) translateX(10px)',
              }}
              width={BLOCK_SIZE}
            >
              <Icon icon={FileImage} size={{ fontSize: ICON_SIZE, strokeWidth: 1.5 }} />
            </Center>
            <Center
              className={styles.icon}
              height={BLOCK_SIZE * 1.25}
              style={{
                transform: 'translateY(-12px)',
                zIndex: 1,
              }}
              width={BLOCK_SIZE}
            >
              <Icon icon={FileUpIcon} size={{ fontSize: ICON_SIZE, strokeWidth: 1.5 }} />
            </Center>
            <Center
              className={styles.icon}
              height={BLOCK_SIZE * 1.25}
              style={{
                background: lighten(0.32, theme.geekblue),
                transform: 'rotateZ(20deg) translateX(-10px)',
              }}
              width={BLOCK_SIZE}
            >
              <Icon icon={FileText} size={{ fontSize: ICON_SIZE, strokeWidth: 1.5 }} />
            </Center>
          </Flexbox>
          <Flexbox align={'center'} gap={8} style={{ textAlign: 'center' }}>
            <Flexbox className={styles.title}>
              {t(enabledFiles ? 'upload.dragFileTitle' : 'upload.dragTitle')}
            </Flexbox>
            <Flexbox className={styles.desc}>
              {t(enabledFiles ? 'upload.dragFileDesc' : 'upload.dragDesc')}
            </Flexbox>
          </Flexbox>
        </Center>
      </div>
    </Center>,
    getContainer()!,
  );
});

export default DragUpload;
