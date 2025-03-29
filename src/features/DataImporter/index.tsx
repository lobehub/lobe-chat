'use client';

import { Upload } from 'antd';
import { createStyles } from 'antd-style';
import { ImportIcon } from 'lucide-react';
import React, { ReactNode, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import DataStyleModal from '@/components/DataStyleModal';
import { importService } from '@/services/import';
import { ImportResult, ImportResults } from '@/services/import/_deprecated';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { ImportPgDataStructure } from '@/types/export';
import { ConfigFile } from '@/types/exportConfig';
import { ErrorShape, FileUploadState, ImportStage, OnImportCallbacks } from '@/types/importer';

import ImportError from './Error';
import { FileUploading } from './FileUploading';
import ImportPreviewModal from './ImportDetail';
import DataLoading from './Loading';
import SuccessResult from './SuccessResult';
import { importConfigFile } from './_deprecated';
import { parseConfigFile } from './config';

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
  const [importResults, setImportResults] = useState<ImportResults | undefined>();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPgData, setImportPgData] = useState<ImportPgDataStructure | undefined>(undefined);

  const dataSource = useMemo(() => {
    if (!importResults) return;

    const { type, ...res } = importResults;

    console.log(res);
    if (type === 'settings') return;

    return Object.entries(res)
      .filter(([, v]) => !!v)
      .map(([item, value]: [string, ImportResult]) => ({
        added: value.added,
        error: value.errors,
        skips: value.skips,
        title: item,
        updated: value.updated || 0,
      }));
  }, [importResults]);

  const isFinished = importState === ImportStage.Success || importState === ImportStage.Error;

  const closeModal = () => {
    setImportState(ImportStage.Finished);
    setImportResults(undefined);
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
          <Center gap={24} paddingInline={16}>
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
        width={isFinished ? 600 : 400}
      >
        {content}
      </DataStyleModal>
      <Upload
        accept={'application/json'}
        beforeUpload={async (file) => {
          const config = await parseConfigFile(file);
          if (!config) return false;

          if (!('schemaHash' in config)) {
            // TODO: remove in V2
            await importConfigFile(file, async (config) => {
              setImportState(ImportStage.Preparing);
              console.log(config);

              const importConfigState = async (
                config: ConfigFile,
                callbacks?: OnImportCallbacks,
              ): Promise<void> => {
                if (config.exportType === 'settings') {
                  await importService.importSettings(config.state.settings);
                  callbacks?.onStageChange?.(ImportStage.Success);
                  return;
                }

                if (config.exportType === 'all') {
                  await importService.importSettings(config.state.settings);
                }

                await importService.importData(
                  {
                    messages: (config.state as any).messages || [],
                    sessionGroups: (config.state as any).sessionGroups || [],
                    sessions: (config.state as any).sessions || [],
                    topics: (config.state as any).topics || [],
                    version: config.version,
                  },
                  callbacks,
                );
              };

              await importConfigState(config, {
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
                  if (data) setImportResults(data);
                  setDuration(duration);
                },
              });

              await refreshSessions();
              await refreshMessages();
              await refreshTopics();
            });

            return false;
          }

          setImportPgData(config);
          setShowImportModal(true);

          return false;
        }}
        className={styles.wrapper}
        maxCount={1}
        showUploadList={false}
      >
        {/* a very hackable solution: add a pseudo before to have a large hot zone */}
        <div className={styles.children}>{children}</div>
      </Upload>
      {importPgData && (
        <ImportPreviewModal
          importData={importPgData}
          onConfirm={async (overwriteExisting) => {
            setImportState(ImportStage.Preparing);

            await importService.importPgData(importPgData, {
              callbacks: {
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
                  if (data) setImportResults(data);
                  setDuration(duration);
                },
              },
              overwriteExisting,
            });

            await refreshSessions();
            await refreshMessages();
            await refreshTopics();
          }}
          onOpenChange={setShowImportModal}
          open={showImportModal}
        />
      )}
    </>
  );
});

export default DataImporter;
