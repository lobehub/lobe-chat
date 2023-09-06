import { Icon } from '@lobehub/ui';
import { App, Button, ConfigProvider, Form, Modal, Popconfirm } from 'antd';
import { createStyles } from 'antd-style';
import { LucideBlocks } from 'lucide-react';
import { lighten } from 'polished';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { CustomPlugin } from '@/types/plugin';

import ManifestForm from './ManifestForm';
import MetaForm from './MetaForm';
import PluginPreview from './PluginPreview';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  content: css`
    .${prefixCls}-modal-content {
      border: 1px solid ${token.colorSplit};
      border-radius: 12px;
    }
  `,
  root: css`
    backdrop-filter: blur(2px);
  `,
}));

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
    const { styles, theme } = useStyles();
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
        <ConfigProvider
          theme={{
            token: {
              colorBgElevated: lighten(0.005, theme.colorBgContainer),
            },
          }}
        >
          <Modal
            centered
            closable
            footer={footer}
            maskClosable
            okText={t('dev.save')}
            onCancel={() => {
              onOpenChange(false);
            }}
            onOk={() => {
              form.submit();
            }}
            open={open}
            title={
              <Flexbox gap={8} horizontal>
                <Icon icon={LucideBlocks} />
                {t('dev.title')}
              </Flexbox>
            }
            width={700}
            wrapClassName={styles.root}
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
        </ConfigProvider>
      </Form.Provider>
    );
  },
);

export default DevModal;
