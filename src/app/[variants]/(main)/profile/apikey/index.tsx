'use client';

import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from '@lobehub/ui';
import { useMutation } from '@tanstack/react-query';
import { Popconfirm, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiKeyService } from '@/services/apiKey';
import { ApiKeyItem, CreateApiKeyParams, UpdateApiKeyParams } from '@/types/apiKey';

import { ApiKeyDisplay, ApiKeyModal, EditableCell } from './features';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    .ant-pro-card-body {
      padding-inline: 0;
    }
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
  const { t } = useTranslation('auth');
  const [modalOpen, setModalOpen] = useState(false);

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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiKeyService.delete(id),
    onSuccess: () => {
      actionRef.current?.reload();
    },
  });

  const handleCreate = () => {
    setModalOpen(true);
  };

  const handleModalOk = (values: CreateApiKeyParams) => {
    createMutation.mutate(values);
  };

  const columns: ProColumns<ApiKeyItem>[] = [
    {
      dataIndex: 'name',
      key: 'name',
      render: (_, apiKey) => (
        <EditableCell
          onSubmit={(name) => {
            if (!name || name === apiKey.name) {
              return;
            }

            updateMutation.mutate({ id: apiKey.id!, params: { name: name as string } });
          }}
          placeholder={t('apikey.display.enterPlaceholder')}
          type="text"
          value={apiKey.name}
        />
      ),
      title: t('apikey.list.columns.name'),
    },
    {
      dataIndex: 'key',
      ellipsis: true,
      key: 'key',
      render: (_, apiKey) => <ApiKeyDisplay apiKey={apiKey.key} />,
      title: t('apikey.list.columns.key'),
      width: 230,
    },
    {
      dataIndex: 'enabled',
      key: 'enabled',
      render: (_, apiKey: ApiKeyItem) => (
        <Switch
          checked={!!apiKey.enabled}
          onChange={(checked) => {
            updateMutation.mutate({ id: apiKey.id!, params: { enabled: checked } });
          }}
        />
      ),
      title: t('apikey.list.columns.status'),
      width: 100,
    },
    {
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (_, apiKey) => (
        <EditableCell
          onSubmit={(expiresAt) => {
            if (expiresAt === apiKey.expiresAt) {
              return;
            }

            updateMutation.mutate({
              id: apiKey.id!,
              params: { expiresAt: expiresAt ? new Date(expiresAt as string) : null },
            });
          }}
          placeholder={t('apikey.display.neverExpires')}
          type="date"
          value={apiKey.expiresAt?.toLocaleString() || t('apikey.display.neverExpires')}
        />
      ),
      title: t('apikey.list.columns.expiresAt'),
      width: 170,
    },
    {
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      renderText: (_, apiKey: ApiKeyItem) =>
        apiKey.lastUsedAt?.toLocaleString() || t('apikey.display.neverUsed'),
      title: t('apikey.list.columns.lastUsedAt'),
    },
    {
      key: 'action',
      render: (_: any, apiKey: ApiKeyItem) => (
        <Popconfirm
          cancelText={t('apikey.list.actions.deleteConfirm.actions.cancel')}
          description={t('apikey.list.actions.deleteConfirm.content')}
          okText={t('apikey.list.actions.deleteConfirm.actions.ok')}
          onConfirm={() => deleteMutation.mutate(apiKey.id!)}
          title={t('apikey.list.actions.deleteConfirm.title')}
        >
          <Button
            icon={Trash}
            size="small"
            style={{ verticalAlign: 'middle' }}
            title={t('apikey.list.actions.delete')}
            type="text"
          />
        </Popconfirm>
      ),
      title: t('apikey.list.columns.actions'),
      width: 100,
    },
  ];

  return (
    <div className={styles.container}>
      <ProTable
        actionRef={actionRef}
        className={styles.table}
        columns={columns}
        headerTitle={t('apikey.list.title')}
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
              {t('apikey.list.actions.create')}
            </Button>,
          ],
        }}
      />
      <ApiKeyModal
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        open={modalOpen}
        submitLoading={createMutation.isPending}
      />
    </div>
  );
};

Page.displayName = 'ApiKeySetting';

export default Page;
