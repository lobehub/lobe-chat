/* globals BlobPart */
import { TRPCClientError } from '@trpc/client';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { fetchErrorNotification } from '@/components/Error/fetchErrorNotification';
import { useAddFilesToKnowledgeBaseModal } from '@/features/KnowledgeBaseModal';
import type { LambdaRouter } from '@/server/routers/lambda';
import { useFileStore } from '@/store/file';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { downloadFile } from '@/utils/client/downloadFile';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

import Config from './Config';
import MultiSelectActions, { MultiSelectActionType } from './MultiSelectActions';
import ViewSwitcher, { ViewMode } from './ViewSwitcher';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    height: 40px;
    padding-block-end: 12px;
    border-block-end: 1px solid ${isDarkMode ? token.colorSplit : rgba(token.colorSplit, 0.06)};
  `,
}));

interface MultiSelectActionsProps {
  config: { showFilesInKnowledgeBase: boolean };
  downloading: boolean;
  knowledgeBaseId?: string;
  onConfigChange: (config: { showFilesInKnowledgeBase: boolean }) => void;
  onViewChange: (view: ViewMode) => void;
  selectCount: number;
  selectFileIds: string[];
  setDownloading: (downloading: boolean) => void;
  setSelectedFileIds: (ids: string[]) => void;
  showConfig?: boolean;
  total?: number;
  totalFileIds: string[];
  viewMode: ViewMode;
}

const ToolBar = memo<MultiSelectActionsProps>(
  ({
    selectCount,
    showConfig,
    setSelectedFileIds,
    selectFileIds,
    total,
    totalFileIds,
    config,
    onConfigChange,
    knowledgeBaseId,
    viewMode,
    onViewChange,
    downloading,
    setDownloading,
  }) => {
    const { styles } = useStyles();
    const { t } = useTranslation(['components', 'file']);

    const [removeFiles, parseFilesToChunks, fileList, batchDownload] = useFileStore((s) => [
      s.removeFiles,
      s.parseFilesToChunks,
      s.fileList,
      s.batchDownload,
    ]);
    const [removeFromKnowledgeBase] = useKnowledgeBaseStore((s) => [
      s.removeFilesFromKnowledgeBase,
    ]);

    const { open } = useAddFilesToKnowledgeBaseModal();
    const { message } = App.useApp();

    const onActionClick = async (type: MultiSelectActionType) => {
      if (downloading) return; // 下载中禁用所有操作

      switch (type) {
        case 'delete': {
          await removeFiles(selectFileIds);
          setSelectedFileIds([]);

          return;
        }
        case 'removeFromKnowledgeBase': {
          if (!knowledgeBaseId) return;

          await removeFromKnowledgeBase(knowledgeBaseId, selectFileIds);
          setSelectedFileIds([]);
          return;
        }
        case 'addToKnowledgeBase': {
          open({
            fileIds: selectFileIds,
            onClose: () => setSelectedFileIds([]),
          });
          return;
        }
        case 'addToOtherKnowledgeBase': {
          open({
            fileIds: selectFileIds,
            knowledgeBaseId,
            onClose: () => setSelectedFileIds([]),
          });
          return;
        }

        case 'batchChunking': {
          const chunkableFileIds = selectFileIds.filter((id) => {
            const file = fileList.find((f) => f.id === id);
            return file && !isChunkingUnsupported(file.fileType);
          });
          await parseFilesToChunks(chunkableFileIds, { skipExist: true });
          setSelectedFileIds([]);
          return;
        }

        case 'batchDownload': {
          if (selectFileIds.length === 1) {
            const file = fileList.find((f) => f.id === selectFileIds[0]);
            if (file) {
              downloadFile(file.url, file.name);
              setSelectedFileIds([]);
            } else {
              message.error(t('file:batchDownload.failed'));
            }
            return;
          }
          setDownloading(true);
          message.loading({
            content: t('file:batchDownload.downloading'),
            duration: 0,
            key: 'batch-download',
          });

          const blobParts: Uint8Array[] = []; // 用于收集所有接收到的数据块

          // 1. 调用 action 获取 subscription 对象
          batchDownload(selectFileIds, {
            onComplete: () => {
              setDownloading(false);
            },
            onData: (event) => {
              switch (event.type) {
                case 'chunk': {
                  const bytes = Uint8Array.from(Buffer.from(event.data, 'base64'));
                  blobParts.push(bytes);
                  break;
                }
                case 'progress': {
                  message.loading({
                    content: `${t('file:batchDownload.downloading')} ${event.message} (${Math.round(
                      event.percent,
                    )}%)`,
                    duration: 0,
                    key: 'batch-download',
                  });
                  break;
                }
                case 'warning': {
                  // 部分文件下载失败，不影响其他文件
                  fetchErrorNotification.error({
                    errorMessage: `${t('file:batchDownload.failed')}: ${event.message}`,
                    status: 500,
                  });
                  break;
                }
                case 'done': {
                  if (event.downloadedCount === selectFileIds.length) {
                    message.success({
                      content: t('file:batchDownload.success'),
                      key: 'batch-download',
                    });
                    setSelectedFileIds([]);
                  } else {
                    message.warning({
                      content: `${t('file:batchDownload.partialSuccess')}: ${event.downloadedCount}/${selectFileIds.length}`,
                      key: 'batch-download',
                    });
                  }
                  const blob = new Blob(blobParts as BlobPart[], { type: 'application/zip' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = event.fileName;
                  document.body.append(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                  setDownloading(false);
                  break;
                }
                case 'error': {
                  message.destroy?.();
                  fetchErrorNotification.error({
                    errorMessage: `${t('file:batchDownload.failed')}: ${event.message}`,
                    status: 500,
                  });
                  setDownloading(false);
                  break;
                }
              }
            },
            onError: (err: TRPCClientError<LambdaRouter>) => {
              console.error('Caught subscription error:', err);
              console.error('Caught subscription error message:', err.message);

              message.destroy?.();

              let finalErrorMessage: string;

              // tRPC 错误无法解析
              if (err && (!err.message || err.message === 'TRPCClientError')) {
                finalErrorMessage = `${t('file:batchDownload.failed')}: ${t(
                  'file:batchDownload.tooManyFiles',
                )}`;
              } else {
                finalErrorMessage = `${t('file:batchDownload.failed')}: ${err.message}`;
              }

              fetchErrorNotification.error({
                errorMessage: finalErrorMessage,
                status: 500,
              });
              setDownloading(false);
            },
          });
          return;
        }
      }
    };

    const isInKnowledgeBase = !!knowledgeBaseId;
    return (
      <Flexbox align={'center'} className={styles.container} horizontal justify={'space-between'}>
        <MultiSelectActions
          downloading={downloading}
          isInKnowledgeBase={isInKnowledgeBase}
          onActionClick={onActionClick}
          onClickCheckbox={() => {
            setSelectedFileIds(selectCount === total ? [] : totalFileIds);
          }}
          selectCount={selectCount}
          total={total}
        />
        <Flexbox gap={8} horizontal>
          <ViewSwitcher onViewChange={onViewChange} view={viewMode} />
          {showConfig && <Config config={config} onConfigChange={onConfigChange} />}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ToolBar;
