'use client';

import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from '@lobehub/ui';
import { useMutation } from '@tanstack/react-query';
import { Popconfirm, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import { FC, useRef, useState } from 'react';

import { apiKeyService } from '@/services/apiKey';
import { ApiKeyItem, CreateApiKeyParams, UpdateApiKeyParams } from '@/types/apiKey';

import { ApiKeyDisplay, ApiKeyModal, EditableCell } from './features';

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

const Page: FC = () => {
  const { styles } = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKeyItem | undefined>();

  const actionRef = useRef<ActionType>(null);

  const createMutation = useMutation({
    mutationFn: (params: CreateApiKeyParams) => apiKeyService.create(params),
    onSuccess: () => {
      actionRef.current?.reload();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateApiKeyParams }) =>
      apiKeyService.update(id, params),
    onSuccess: () => {
      actionRef.current?.reload();
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiKeyService.delete(id),
    onSuccess: () => {
      actionRef.current?.reload();
    },
  });

  const handleCreate = () => {
    setEditingApiKey(undefined);
    setModalOpen(true);
  };

  const handleModalOk = (values: CreateApiKeyParams | UpdateApiKeyParams) => {
    if (editingApiKey) {
      updateMutation.mutate({ id: editingApiKey.id!, params: values });
    } else {
      createMutation.mutate(values as CreateApiKeyParams);
    }
  };

  const columns: ProColumns<ApiKeyItem>[] = [
    {
      dataIndex: 'name',
      key: 'name',
      render: (_, apiKey) => (
        <EditableCell
          onSubmit={() => {
            console.log('onSubmit');
          }}
          placeholder="请输入"
          type="text"
          value={apiKey.name}
        />
      ),
      title: '名称',
    },
    {
      dataIndex: 'key',
      ellipsis: true,
      key: 'key',
      render: (_, apiKey) => <ApiKeyDisplay apiKey={apiKey.key} />,
      title: 'Key',
      width: 230,
    },
    {
      dataIndex: 'enabled',
      key: 'enabled',
      render: (_, apiKey: ApiKeyItem) => (
        <Switch
          checked={!!apiKey.enabled}
          loading={updateMutation.isPending}
          onChange={(checked) => {
            updateMutation.mutate({ id: apiKey.id!, params: { enabled: checked } });
          }}
        />
      ),
      title: '启用状态',
      width: 100,
    },
    {
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (_, apiKey) => (
        <EditableCell
          onSubmit={() => {
            console.log('onSubmit');
          }}
          placeholder="永不过期"
          type="date"
          value={apiKey.expiresAt?.toLocaleString() || '永不过期'}
        />
      ),
      title: '过期时间',
      width: 170,
    },
    {
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      renderText: (_, apiKey: ApiKeyItem) => apiKey.lastUsedAt?.toLocaleString() || '从未使用',
      title: '最后使用时间',
    },
    {
      key: 'action',
      render: (_: any, apiKey: ApiKeyItem) => (
        <Popconfirm
          onConfirm={() => deleteMutation.mutate(apiKey.id!)}
          title="确认删除该 API-Key 吗？"
        >
          <Button icon={Trash} size="small" title="删除" type="text" />
        </Popconfirm>
      ),
      title: '操作',
      width: 60,
    },
  ];

  return (
    <div className={styles.container}>
      <ProTable
        actionRef={actionRef}
        className={styles.table}
        columns={columns}
        headerTitle="API Key 列表"
        options={false}
        pagination={false}
        request={async () => {
          const apiKeys = await apiKeyService.list();

          return {
            data: apiKeys,
            success: true,
          };
        }}
        rowKey="id"
        search={false}
        toolbar={{
          actions: [
            <Button key="create" onClick={handleCreate} type="primary">
              创建 API Key
            </Button>,
          ],
        }}
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

Page.displayName = 'ApiKeySetting';

export default Page;
