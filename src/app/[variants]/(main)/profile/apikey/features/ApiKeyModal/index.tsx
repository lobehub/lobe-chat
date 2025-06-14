import { DatePicker, FormModal, Input, TextArea } from '@lobehub/ui';
import { FC } from 'react';

import { ApiKeyItem, CreateApiKeyParams, UpdateApiKeyParams } from '@/types/apiKey';

interface ApiKeyModalProps {
  initialValues?: Partial<ApiKeyItem>;
  onCancel: () => void;
  onOk: (values: CreateApiKeyParams | UpdateApiKeyParams) => void;
  open: boolean;
}

const ApiKeyModal: FC<ApiKeyModalProps> = ({ open, onCancel, onOk, initialValues }) => {
  const isEdit = !!initialValues?.id;

  return (
    <FormModal
      destroyOnHidden
      height={'90%'}
      initialValues={initialValues}
      itemMinWidth={'max(30%,240px)'}
      items={[
        {
          children: <Input placeholder="请输入 API Key 名称" />,
          label: '名称',
          name: 'name',
          rules: [{ required: true }],
        },
        {
          children: <TextArea placeholder="请输入 API Key 描述" />,
          label: '描述',
          name: 'description',
        },
        {
          children: <DatePicker placeholder="永不过期" style={{ width: '100%' }} />,
          label: '过期时间',
          name: 'expiresAt',
        },
      ]}
      itemsType={'flat'}
      onCancel={onCancel}
      onFinish={onOk}
      open={open}
      submitLoading={false}
      submitText={isEdit ? '保存' : '创建'}
      title={isEdit ? '编辑 API Key' : '创建 API Key'}
    />
  );
};

export default ApiKeyModal;
