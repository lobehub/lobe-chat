'use client';

import { ProColumns, ProTable } from '@ant-design/pro-components';
import { ActionIcon, Button } from '@lobehub/ui';
import { Typography, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { ragEvalService } from '@/services/ragEval';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { EvalDatasetRecordRefFile } from '@/types/eval';

const createRequest = (activeDatasetId: number) => async () => {
  const records = await ragEvalService.getDatasetRecords(activeDatasetId);

  return {
    data: records,
    success: true,
    total: records.length,
  };
};

const useStyles = createStyles(({ css }) => ({
  container: css`
    padding-block: 0;
    padding-inline: 12px;
  `,
  icon: css`
    min-width: 24px;
    border-radius: 4px;
  `,
  title: css`
    font-size: 16px;
  `,
}));

const DatasetDetail = () => {
  const { t } = useTranslation(['ragEval', 'common']);
  const { styles } = useStyles();
  const [importDataset] = useKnowledgeBaseStore((s) => [s.importDataset]);

  const [activeDatasetId] = useQueryState('id', parseAsInteger);

  const columns: ProColumns[] = [
    {
      dataIndex: 'question',
      ellipsis: true,
      title: t('dataset.list.table.columns.question.title'),
      width: '40%',
    },
    { dataIndex: 'ideal', ellipsis: true, title: t('dataset.list.table.columns.ideal.title') },
    {
      dataIndex: 'referenceFiles',
      render: (dom, entity) => {
        const referenceFiles = entity.referenceFiles as EvalDatasetRecordRefFile[];

        return (
          !!referenceFiles && (
            <Flexbox>
              {referenceFiles?.map((file) => (
                <Flexbox gap={4} horizontal key={file.id}>
                  <FileIcon fileName={file.name} fileType={file.fileType} size={20} />
                  <Typography.Text ellipsis={{ tooltip: true }}>{file.name}</Typography.Text>
                </Flexbox>
              ))}
            </Flexbox>
          )
        );
      },
      title: t('dataset.list.table.columns.referenceFiles.title'),
      width: 200,
    },
    {
      dataIndex: 'actions',
      render: () => (
        <Flexbox gap={4} horizontal>
          <ActionIcon icon={Edit2Icon} size={'small'} title={t('edit', { ns: 'common' })} />
          <ActionIcon icon={Trash2Icon} size={'small'} title={t('delete', { ns: 'common' })} />
        </Flexbox>
      ),
      title: t('dataset.list.table.columns.actions'),

      width: 80,
    },
  ];

  const request = !!activeDatasetId ? createRequest(activeDatasetId) : undefined;

  return !activeDatasetId ? (
    <Center height={'100%'} width={'100%'}>
      {t('dataset.list.table.notSelected')}
    </Center>
  ) : (
    <Flexbox className={styles.container} gap={24}>
      <ProTable
        columns={columns}
        request={request}
        search={false}
        size={'small'}
        toolbar={{
          actions: [
            <Upload
              beforeUpload={async (file) => {
                await importDataset(file, activeDatasetId);

                return false;
              }}
              key={'upload'}
              multiple={false}
              showUploadList={false}
            >
              <Button type={'primary'}>{t('dataset.list.table.actions.importData')}</Button>
            </Upload>,
          ],
          title: <div className={styles.title}>{t('dataset.list.table.title')}</div>,
        }}
      />
    </Flexbox>
  );
};

export default DatasetDetail;
