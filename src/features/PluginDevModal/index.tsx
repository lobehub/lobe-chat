import { Modal } from '@lobehub/ui';
import { App, Button, Form, Popconfirm } from 'antd';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { CustomPlugin } from '@/types/plugin';

import ManifestForm from './ManifestForm';
import MetaForm from './MetaForm';
import PluginPreview from './PluginPreview';

interface DevModalProps {
  mode?: 'edit' | 'create';
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSave?: (value: CustomPlugin) => Promise<void> | void;
  onValueChange?: (value: Partial<CustomPlugin>) => void;
  open?: boolean;
  value?: CustomPlugin;
}

const DevModal = memo<DevModalProps>(
  ({ open, mode = 'create', value, onValueChange, onSave, onOpenChange, onDelete }) => {
    const isEditMode = mode === 'edit';
    const { t } = useTranslation('plugin');
    const { message } = App.useApp();

    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
      form.setFieldsValue(value);
    }, []);

    const footer = (
      <Flexbox horizontal justify={'space-between'} style={{ marginTop: 24 }}>
        {isEditMode ? (
          <Popconfirm
            okButtonProps={{
              danger: true,
              type: 'primary',
            }}
            onConfirm={() => {
              onDelete?.();
              message.success(t('dev.deleteSuccess'));
            }}
            placement={'topLeft'}
            title={t('dev.confirmDeleteDevPlugin')}
          >
            <Button danger>{t('delete', { ns: 'common' })}</Button>
          </Popconfirm>
        ) : (
          <div />
        )}

        <Flexbox horizontal>
          <Button
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t('cancel', { ns: 'common' })}
          </Button>
          <Button
            loading={submitting}
            onClick={() => {
              form.submit();
            }}
            type={'primary'}
          >
            {t(isEditMode ? 'dev.update' : 'dev.save')}
          </Button>
        </Flexbox>
      </Flexbox>
    );

    return (
      <Form.Provider
        onFormChange={() => {
          onValueChange?.(form.getFieldsValue());
        }}
        onFormFinish={async (_, info) => {
          if (onSave) {
            setSubmitting(true);
            await onSave?.(info.values as CustomPlugin);
            setSubmitting(false);
          }
          message.success(t(isEditMode ? 'dev.updateSuccess' : 'dev.saveSuccess'));
          onOpenChange(false);
        }}
      >
        <Modal
          cancelText={t('cancel', { ns: 'common' })}
          footer={footer}
          okText={t('dev.save')}
          onCancel={() => onOpenChange(false)}
          onOk={() => form.submit()}
          open={open}
          title={t('dev.title')}
        >
          <Flexbox gap={12}>
            {t('dev.modalDesc')}
            {/*<Tabs*/}
            {/*  items={[*/}
            {/*    { children: <MetaForm />, key: 'meta', label: t('dev.tabs.meta') },*/}
            {/*    { children: <ManifestForm />, key: 'manifest', label: t('dev.tabs.manifest') },*/}
            {/*  ]}*/}
            {/*/>*/}
            <PluginPreview form={form} />
            <ManifestForm form={form} />
            <MetaForm form={form} mode={mode} />
          </Flexbox>
        </Modal>
      </Form.Provider>
    );
  },
);

export default DevModal;
