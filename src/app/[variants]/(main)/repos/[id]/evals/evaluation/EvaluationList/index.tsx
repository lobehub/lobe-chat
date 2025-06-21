'use client';

import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { ActionIcon, Button, ButtonProps, Icon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { DownloadIcon, PlayIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ragEvalService } from '@/services/ragEval';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { EvalEvaluationStatus, RAGEvalEvaluationItem } from '@/types/eval';

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
  const [removeEvaluation, runEvaluation, checkEvaluationStatus] = useKnowledgeBaseStore((s) => [
    s.removeEvaluation,
    s.runEvaluation,
    s.checkEvaluationStatus,
  ]);
  const [isCheckingStatus, setCheckingStatus] = useState(false);
  const { modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);

  const columns: ProColumns<RAGEvalEvaluationItem>[] = [
    {
      dataIndex: 'name',
      ellipsis: true,
      title: t('evaluation.table.columns.name.title'),
    },
    {
      dataIndex: ['dataset', 'id'],
      render: (dom, entity) => {
        return (
          <Link
            href={`/repos/${knowledgeBaseId}/evals/dataset?id=${entity.dataset.id}`}
            style={{ color: 'initial' }}
            target={'_blank'}
          >
            {entity.dataset.name}
          </Link>
        );
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
    },
    {
      dataIndex: ['recordsStats', 'total'],
      render: (dom, entity) => {
        return entity.status === 'Pending'
          ? entity.recordsStats.total
          : `${entity.recordsStats.success}/${entity.recordsStats.total}`;
      },
      title: t('evaluation.table.columns.records.title'),
    },
    {
      dataIndex: 'actions',
      render: (_, entity) => {
        const actionsMap: Record<EvalEvaluationStatus, ButtonProps> = {
          [EvalEvaluationStatus.Pending]: {
            children: t('evaluation.table.columns.actions.run'),
            icon: <Icon icon={PlayIcon} />,
            onClick: () => {
              modal.confirm({
                content: t('evaluation.table.columns.actions.confirmRun'),
                onOk: async () => {
                  await runEvaluation(entity.id);
                  await actionRef.current?.reload();
                },
              });
            },
          },
          [EvalEvaluationStatus.Error]: {
            children: t('evaluation.table.columns.actions.retry'),
            icon: <Icon icon={RotateCcwIcon} />,
            onClick: () => {
              modal.confirm({
                content: t('evaluation.table.columns.actions.confirmRun'),
                onOk: async () => {
                  await runEvaluation(entity.id);
                  await actionRef.current?.reload();
                },
              });
            },
          },
          [EvalEvaluationStatus.Processing]: {
            children: t('evaluation.table.columns.actions.checkStatus'),
            icon: null,
            loading: isCheckingStatus,
            onClick: async () => {
              setCheckingStatus(true);
              await checkEvaluationStatus(entity.id);
              setCheckingStatus(false);
              await actionRef.current?.reload();
            },
          },
          [EvalEvaluationStatus.Success]: {
            children: t('evaluation.table.columns.actions.downloadRecords'),
            icon: <Icon icon={DownloadIcon} />,
            onClick: async () => {
              window.open(entity.evalRecordsUrl);
            },
          },
        };

        const actionProps = actionsMap[entity.status];

        return (
          <Flexbox gap={4} horizontal>
            {!actionProps ? null : <Button {...actionProps} size={'small'} />}
            <ActionIcon
              icon={Trash2Icon}
              onClick={async () => {
                modal.confirm({
                  content: t('evaluation.table.columns.actions.confirmDelete'),
                  okButtonProps: {
                    danger: true,
                  },
                  onOk: async () => {
                    await removeEvaluation(entity.id);
                    await actionRef.current?.reload();
                  },
                });
              }}
              size={'small'}
              title={t('delete', { ns: 'common' })}
            />
          </Flexbox>
        );
      },
      title: t('evaluation.table.columns.actions.title'),
      width: 120,
    },
  ];

  const request = knowledgeBaseId ? createRequest(knowledgeBaseId) : undefined;

  return (
    <Flexbox gap={24}>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={false}
        toolbar={{
          actions: [
            <CreateEvaluationButton
              key={'new'}
              knowledgeBaseId={knowledgeBaseId}
              onCreate={() => {
                actionRef.current?.reload();
              }}
            />,
          ],
          title: <div className={styles.title}>{t('evaluation.table.title')}</div>,
        }}
      />
    </Flexbox>
  );
};

export default EvaluationList;
