import { Icon } from '@lobehub/ui';
import { App, Button, ConfigProvider, Form, Modal, Popconfirm } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { LucideBlocks } from 'lucide-react';
import { lighten } from 'polished';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DevPlugin } from '@/store/plugin/initialState';

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
    backdrop-filter: blur(5px);
  `,
}));

interface DevModalProps {
  mode?: 'edit' | 'create';
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSave?: (value: DevPlugin) => void;
  onValueChange?: (value: Partial<DevPlugin>) => void;
  open?: boolean;
  value?: DevPlugin;
}

const DevModal = memo<DevModalProps>(
  ({ open, mode = 'create', value, onValueChange, onSave, onOpenChange, onDelete }) => {
    const { t } = useTranslation('plugin');

    const [form] = Form.useForm();
    const theme = useTheme();

    const { styles } = useStyles();

    const { message } = App.useApp();

    useEffect(() => {
      form.setFieldsValue(value);
    }, []);

    const isEditMode = mode === 'edit';

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
        onFormFinish={(_, info) => {
          onSave?.(info.values as DevPlugin);
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
