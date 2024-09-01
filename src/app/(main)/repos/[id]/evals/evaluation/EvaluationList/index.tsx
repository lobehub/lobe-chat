'use client';

import { ProColumns, ProTable } from '@ant-design/pro-components';
import { ActionIcon } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import CreateEvaluationButton from '@/app/(main)/repos/[id]/evals/evaluation/CreateEvaluation';
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
  icon: css`
    min-width: 24px;
    border-radius: 4px;
  `,
  title: css`
    font-size: 16px;
  `,
}));

const EvaluationList = ({ knowledgeBaseId }: { knowledgeBaseId: string }) => {
  const { t } = useTranslation(['ragEval', 'common']);
  const { styles } = useStyles();
  const [activeDatasetId] = useKnowledgeBaseStore((s) => [s.activeDatasetId]);

  const columns: ProColumns[] = [
    {
      dataIndex: 'question',
      ellipsis: true,
      title: t('evaluation.table.columns.question.title'),
      width: '40%',
    },
    { dataIndex: 'ideal', ellipsis: true, title: t('evaluation.table.columns.ideal.title') },
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
      title: t('evaluation.table.columns.referenceFiles.title'),
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
      title: t('evaluation.table.columns.actions'),

      width: 80,
    },
  ];

  const request = activeDatasetId ? createRequest(activeDatasetId) : undefined;

  return (
    <Flexbox gap={24}>
      <ProTable
        columns={columns}
        request={request}
        search={false}
        size={'small'}
        toolbar={{
          actions: [<CreateEvaluationButton key={'new'} knowledgeBaseId={knowledgeBaseId} />],
          title: <div className={styles.title}>{t('evaluation.table.title')}</div>,
        }}
      />
    </Flexbox>
  );
};

export default EvaluationList;
