'use client';

import { ProColumns, ProTable } from '@ant-design/pro-components';
import { ActionIcon } from '@lobehub/ui';
import { Button, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import { Center, Flexbox } from 'react-layout-kit';

import { ragEvalService } from '@/services/ragEval';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

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
    padding: 12px;
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
  const { styles } = useStyles();
  const [activeDatasetId, importDataset] = useKnowledgeBaseStore((s) => [
    s.activeDatasetId,
    s.importDataset,
  ]);

  const columns: ProColumns[] = [
    { dataIndex: 'question', ellipsis: true, title: '问题', width: '40%' },
    { dataIndex: 'ideal', ellipsis: true, title: '期望回答' },
    { dataIndex: 'referenceFiles', title: '参考文件' },
    {
      dataIndex: 'actions',
      render: () => (
        <Flexbox gap={4} horizontal>
          <ActionIcon icon={Edit2Icon} size={'small'} title={'编辑'} />
          <ActionIcon icon={Trash2Icon} size={'small'} title={'删除'} />
        </Flexbox>
      ),
      title: '操作',

      width: 80,
    },
  ];

  const request = activeDatasetId ? createRequest(activeDatasetId) : undefined;

  return !activeDatasetId ? (
    <Center height={'100%'} width={'100%'}>
      请在左侧选择数据集
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
                await importDataset(file);

                return false;
              }}
              key={'upload'}
              multiple={false}
              showUploadList={false}
            >
              <Button type={'primary'}>导入数据</Button>
            </Upload>,
          ],
          title: <div className={styles.title}>数据集详情</div>,
        }}
      />
    </Flexbox>
  );
};

export default DatasetDetail;
