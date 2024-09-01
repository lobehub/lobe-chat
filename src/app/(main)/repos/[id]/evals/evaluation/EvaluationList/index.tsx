'use client';

import { ProColumns, ProTable } from '@ant-design/pro-components';
import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import CreateEvaluationButton from '@/app/(main)/repos/[id]/evals/evaluation/CreateEvaluation';
import { ragEvalService } from '@/services/ragEval';

const createRequest = (knowledgeBaseId: string) => async () => {
  const records = await ragEvalService.getEvaluationList(knowledgeBaseId);

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

  const columns: ProColumns[] = [
    {
      dataIndex: 'name',
      ellipsis: true,
      title: t('evaluation.table.columns.name.title'),
      width: '50%',
    },
    {
      dataIndex: 'datasetId',
      render: (dom, entity) => {
        return <Flexbox>{entity.datasetId}</Flexbox>;
      },
      title: t('evaluation.table.columns.datasetId.title'),
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

  const request = knowledgeBaseId ? createRequest(knowledgeBaseId) : undefined;

  return (
    <Flexbox gap={24}>
      <ProTable
        columns={columns}
        request={request}
        search={false}
        toolbar={{
          actions: [<CreateEvaluationButton key={'new'} knowledgeBaseId={knowledgeBaseId} />],
          title: <div className={styles.title}>{t('evaluation.table.title')}</div>,
        }}
      />
    </Flexbox>
  );
};

export default EvaluationList;
