import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Table } from 'antd';
import { createStyles } from 'antd-style';
import { FC, useState } from 'react';

import { apiKeyService } from '@/services/apiKey';
import { ApiKeyItem, CreateApiKeyParams, UpdateApiKeyParams } from '@/types/apiKey';

import ApiKeyModal from '../ApiKeyModal';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: ${token.padding}px;
  `,
  header: css`
    display: flex;
    justify-content: flex-end;
    margin-block-end: ${token.margin}px;
  `,
  table: css`
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
}));

const ApiKeyList: FC = () => {
  const { styles } = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKeyItem | undefined>();
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading } = useQuery<ApiKeyItem[]>({
    queryFn: () => apiKeyService.list(),
    queryKey: ['apiKeys'],
  });

  const createMutation = useMutation({
    mutationFn: (params: CreateApiKeyParams) => apiKeyService.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateApiKeyParams }) =>
      apiKeyService.update(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setModalOpen(false);
    },
  });

  const handleCreate = () => {
    setEditingApiKey(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: ApiKeyItem) => {
    setEditingApiKey(record);
    setModalOpen(true);
  };

  const handleModalOk = (values: CreateApiKeyParams | UpdateApiKeyParams) => {
    if (editingApiKey) {
      updateMutation.mutate({ id: editingApiKey.id, params: values });
    } else {
      createMutation.mutate(values as CreateApiKeyParams);
    }
  };

  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      title: '名称',
    },
    {
      dataIndex: 'description',
      key: 'description',
      title: '描述',
    },
    {
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (enabled ? '启用' : '禁用'),
      title: '状态',
    },
    {
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: Date | null) => expiresAt?.toLocaleString() || '永不过期',
      title: '过期时间',
    },
    {
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (lastUsedAt: Date | null) => lastUsedAt?.toLocaleString() || '从未使用',
      title: '最后使用时间',
    },
    {
      key: 'action',
      render: (_: any, record: ApiKeyItem) => (
        <Button onClick={() => handleEdit(record)} type="link">
          编辑
        </Button>
      ),
      title: '操作',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button onClick={handleCreate} type="primary">
          创建 API Key
        </Button>
      </div>
      <Table
        className={styles.table}
        columns={columns}
        dataSource={apiKeys}
        loading={isLoading}
        rowKey="id"
      />
      <ApiKeyModal
        initialValues={editingApiKey}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        open={modalOpen}
      />
    </div>
  );
};

export default ApiKeyList;
