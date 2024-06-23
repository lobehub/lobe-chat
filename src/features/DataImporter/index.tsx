'use client';

import { Upload } from 'antd';
import { createStyles } from 'antd-style';
import { ImportIcon } from 'lucide-react';
import React, { ReactNode, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import DataStyleModal from '@/components/DataStyleModal';
import { ImportResult, ImportResults, configService } from '@/services/config';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { ErrorShape, FileUploadState, ImportStage } from '@/types/importer';
import { importConfigFile } from '@/utils/config';

import ImportError from './Error';
import { FileUploading } from './FileUploading';
import DataLoading from './Loading';
import SuccessResult from './SuccessResult';

const useStyles = createStyles(({ css }) => ({
  children: css`
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: transparent;
    }
  `,
  wrapper: css`
    font-size: inherit;
  `,
}));

interface DataImporterProps {
  children?: ReactNode;
  onFinishImport?: () => void;
}

const DataImporter = memo<DataImporterProps>(({ children, onFinishImport }) => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  const refreshSessions = useSessionStore((s) => s.refreshSessions);
  const [refreshMessages, refreshTopics] = useChatStore((s) => [s.refreshMessages, s.refreshTopic]);

  const [duration, setDuration] = useState(0);
  const [importState, setImportState] = useState(ImportStage.Start);

  const [fileUploadingState, setUploadingState] = useState<FileUploadState | undefined>();
  const [importError, setImportError] = useState<ErrorShape | undefined>();
  const [importData, setImportData] = useState<ImportResults | undefined>();

  const dataSource = useMemo(() => {
    if (!importData) return;

    const { type, ...res } = importData;

    if (type === 'settings') return;

    return Object.entries(res)
      .filter(([, v]) => !!v)
      .map(([item, value]: [string, ImportResult]) => ({
        added: value.added,
        error: value.errors,
        skips: value.skips,
        title: t(`importModal.result.${item as keyof ImportResults}`),
      }));
  }, [importData]);

  const isFinished = importState === ImportStage.Success || importState === ImportStage.Error;

  const closeModal = () => {
    setImportState(ImportStage.Finished);
    setImportData(undefined);
    setImportError(undefined);
    setUploadingState(undefined);

    onFinishImport?.();
  };

  const content = useMemo(() => {
    switch (importState) {
      case ImportStage.Preparing: {
        return (
          <Center gap={24} padding={40}>
            <DataLoading />
            <p>{t('importModal.preparing')}</p>
          </Center>
        );
      }

      case ImportStage.Importing: {
        return (
          <Center gap={24} padding={40}>
            <DataLoading />
            <p>{t('importModal.loading')}</p>
          </Center>
        );
      }

      case ImportStage.Uploading: {
        return (
          <Center gap={24} padding={40}>
            <FileUploading
              progress={fileUploadingState?.progress}
              restTime={fileUploadingState?.restTime}
              speed={fileUploadingState?.speed}
            />
          </Center>
        );
      }

      case ImportStage.Success: {
        return (
          <Center gap={24} paddingInline={40}>
            <SuccessResult dataSource={dataSource} duration={duration} onClickFinish={closeModal} />
          </Center>
        );
      }
      case ImportStage.Error: {
        return (
          <Center gap={24} paddingBlock={24} paddingInline={0}>
            <ImportError error={importError} onClick={closeModal} />
          </Center>
        );
      }

      default: {
        return undefined;
      }
    }
  }, [importState, fileUploadingState]);

  return (
    <>
      <DataStyleModal
        icon={ImportIcon}
        open={importState !== ImportStage.Start && importState !== ImportStage.Finished}
        title={t('importModal.title')}
        width={isFinished ? 500 : 400}
      >
        {content}
      </DataStyleModal>
      <Upload
        beforeUpload={async (file) => {
          await importConfigFile(file, async (config) => {
            setImportState(ImportStage.Preparing);

            await configService.importConfigState(config, {
              onError: (error) => {
                setImportError(error);
              },
              onFileUploading: (state) => {
                setUploadingState(state);
              },
              onStageChange: (stage) => {
                setImportState(stage);
              },
              onSuccess: (data, duration) => {
                if (data) setImportData(data);
                setDuration(duration);
              },
            });

            await refreshSessions();
            await refreshMessages();
            await refreshTopics();
          });

          return false;
        }}
        className={styles.wrapper}
        maxCount={1}
        showUploadList={false}
      >
        {/* a very hackable solution: add a pseudo before to have a large hot zone */}
        <div className={styles.children}>{children}</div>
      </Upload>
    </>
  );
});

export default DataImporter;
