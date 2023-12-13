import { Icon } from '@lobehub/ui';
import { Button, Result, Table, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { CheckCircle, ImportIcon } from 'lucide-react';
import React, { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import DataStyleModal from '@/components/DataStyleModal';
import { useImportConfig } from '@/hooks/useImportConfig';
import { ImportResult, ImportResults } from '@/services/config';

const useStyles = createStyles(({ css, token }) => {
  const size = 28;

  return {
    loader: css`
      transform: translateX(-${size * 2}px);

      aspect-ratio: 1;
      width: 6px;

      color: ${token.colorPrimary};

      border-radius: 50%;
      box-shadow:
        ${size}px -${size}px 0 0,
        ${size * 2}px -${size}px 0 0,
        ${size * 3}px -${size}px 0 0,
        ${size}px 0 0 5px,
        ${size * 2}px 0 0 5px,
        ${size * 3}px 0 0 5px,
        ${size}px ${size}px 0 0,
        ${size * 2}px ${size}px 0 0,
        ${size * 3}px ${size}px 0 0;

      animation: loading 2s infinite linear;

      @keyframes loading {
        12.5% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 0,
            ${size * 3}px -${size}px 0 5px,
            ${size}px 0 0 5px,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 5px,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 0;
        }

        25% {
          box-shadow:
            ${size}px -${size}px 0 5px,
            ${size * 2}px -${size}px 0 0,
            ${size * 3}px -${size}px 0 5px,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 5px,
            ${size * 3}px ${size}px 0 0;
        }

        50% {
          box-shadow:
            ${size}px -${size}px 0 5px,
            ${size * 2}px -${size}px 0 5px,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 5px;
        }

        62.5% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 0,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 5px,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 5px,
            ${size * 3}px ${size}px 0 5px;
        }

        75% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 5px,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 5px,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 5px;
        }

        87.5% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 5px,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 5px,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 5px,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 0;
        }
      }
    `,
  };
});

enum ImportState {
  Start,
  Loading,
  Finished,
  Close,
}

interface DataImporterProps {
  children?: ReactNode;
  onFinishImport?: () => void;
}
const DataImporter = memo<DataImporterProps>(({ children, onFinishImport }) => {
  const { t } = useTranslation('common');
  const { importConfig } = useImportConfig();
  const [duration, setDuration] = useState(0);
  const [importState, setImportState] = useState(ImportState.Start);
  const [importData, setImportData] = useState<ImportResults | undefined>();
  const { styles } = useStyles();

  return (
    <>
      <DataStyleModal
        icon={ImportIcon}
        open={importState === ImportState.Loading || importState === ImportState.Finished}
        title={t('importModal.title')}
        width={importState === ImportState.Finished ? 500 : 400}
      >
        <Center
          gap={24}
          padding={40}
          style={{
            paddingBlock: importState === ImportState.Finished ? 0 : undefined,
          }}
        >
          {importState === ImportState.Finished ? (
            // TODO: 在这里加个撒花效果
            <Result
              extra={
                <Button
                  onClick={() => {
                    setImportState(ImportState.Close);

                    onFinishImport?.();
                  }}
                  size={'large'}
                  type={'primary'}
                >
                  {t('importModal.finish.start')}
                </Button>
              }
              icon={<Icon icon={CheckCircle} />}
              status={'success'}
              style={{ paddingBlock: 24 }}
              subTitle={
                // if there is no importData, means it's only import the settings
                !importData ? (
                  t('importModal.finish.onlySettings')
                ) : (
                  <Flexbox gap={16} width={400}>
                    {t('importModal.finish.subTitle', { duration: (duration / 1000).toFixed(2) })}
                    <Table
                      bordered
                      columns={[
                        { dataIndex: 'title', title: t('importModal.result.type') },
                        { dataIndex: 'added', title: t('importModal.result.added') },
                        { dataIndex: 'skips', title: t('importModal.result.skips') },
                        { dataIndex: 'error', title: t('importModal.result.errors') },
                      ]}
                      dataSource={Object.entries(importData).map(
                        ([item, value]: [string, ImportResult]) => ({
                          added: value.added,
                          error: value.errors,
                          skips: value.skips,
                          title: t(`importModal.result.${item as keyof ImportResults}`),
                        }),
                      )}
                      pagination={false}
                      size={'small'}
                    />
                  </Flexbox>
                )
              }
              title={t('importModal.finish.title')}
            />
          ) : (
            <>
              <Center style={{ height: 80 }}>
                <div className={styles.loader} />
              </Center>
              <p>{t('importModal.loading')}</p>
            </>
          )}
        </Center>
      </DataStyleModal>
      <Upload
        beforeUpload={async (file) => {
          setImportState(ImportState.Loading);
          const time = Date.now();
          const data = await importConfig(file);

          if (data) {
            setImportData(data);
          }

          setDuration(Date.now() - time);
          setImportState(ImportState.Finished);

          return false;
        }}
        maxCount={1}
        showUploadList={false}
      >
        {children}
      </Upload>
    </>
  );
});

export default DataImporter;
