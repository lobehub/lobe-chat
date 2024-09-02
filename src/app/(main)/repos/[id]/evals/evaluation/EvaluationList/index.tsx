'use client';

import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Button } from 'antd';
import { createStyles } from 'antd-style';
import { PlayIcon, Trash2Icon } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ragEvalService } from '@/services/ragEval';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { EvalEvaluationStatus } from '@/types/eval';

import CreateEvaluationButton from '../CreateEvaluation';

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
  const [, runEvaluation] = useKnowledgeBaseStore((s) => [s.removeEvaluation, s.runEvaluation]);
  const { modal } = App.useApp();
  const actionRef = useRef<ActionType>();

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
      dataIndex: 'status',
      title: t('evaluation.table.columns.status.title'),
      valueEnum: {
        [EvalEvaluationStatus.Error]: {
          status: 'error',
          text: t('evaluation.table.columns.status.error'),
        },
        [EvalEvaluationStatus.Processing]: {
          status: 'processing',
          text: t('evaluation.table.columns.status.processing'),
        },
        [EvalEvaluationStatus.Pending]: {
          status: 'default',
          text: t('evaluation.table.columns.status.pending'),
        },
        [EvalEvaluationStatus.Success]: {
          status: 'success',
          text: t('evaluation.table.columns.status.success'),
        },
      },
      width: '50%',
    },
    {
      dataIndex: 'actions',
      render: (_, entity) => (
        <Flexbox gap={4} horizontal>
          <Button
            icon={<Icon icon={PlayIcon} />}
            onClick={() => {
              modal.confirm({
                content: t('evaluation.table.columns.actions.confirmRun'),
                onOk: async () => {
                  await runEvaluation(entity.id);
                  await actionRef.current?.reload();
                },
              });
            }}
            size={'small'}
            type={'primary'}
          >
            {t('evaluation.table.columns.actions.run')}
          </Button>
          <ActionIcon icon={Trash2Icon} size={'small'} title={t('delete', { ns: 'common' })} />
        </Flexbox>
      ),
      title: t('evaluation.table.columns.actions.title'),
      width: 120,
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
