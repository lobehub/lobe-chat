import { Alert, Icon, Modal, Tooltip } from '@lobehub/ui';
import { App, Button, Form, Popconfirm, Segmented } from 'antd';
import { useResponsive } from 'antd-style';
import { MoveUpRight } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import MobilePadding from '@/components/MobilePadding';
import { WIKI_PLUGIN_GUIDE } from '@/const/url';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import LocalForm from './LocalForm';
import PluginPreview from './PluginPreview';
import UrlModeForm from './UrlModeForm';

interface DevModalProps {
  mode?: 'edit' | 'create';
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSave?: (value: LobeToolCustomPlugin) => Promise<void> | void;
  onValueChange?: (value: Partial<LobeToolCustomPlugin>) => void;
  open?: boolean;
  value?: LobeToolCustomPlugin;
}

const DevModal = memo<DevModalProps>(
  ({ open, mode = 'create', value, onValueChange, onSave, onOpenChange, onDelete }) => {
    const isEditMode = mode === 'edit';
    const [configMode, setConfigMode] = useState<'url' | 'local'>('url');
    const { t } = useTranslation('plugin');
    const { message } = App.useApp();
    const { mobile } = useResponsive();
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

            await onSave?.(info.values as LobeToolCustomPlugin);
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
          onCancel={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}
          onOk={(e) => {
            e.stopPropagation();
            form.submit();
          }}
          open={open}
          title={t('dev.title')}
        >
          <Flexbox
            gap={mobile ? 0 : 16}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MobilePadding bottom={0} gap={16}>
              <Alert
                message={
                  <Trans i18nKey={'dev.modalDesc'} ns={'plugin'}>
                    添加自定义插件后，可用于插件开发验证，也可直接在会话中使用。插件开发文档请参考：
                    <a
                      href={WIKI_PLUGIN_GUIDE}
                      rel="noreferrer"
                      style={{ paddingInline: 8 }}
                      target={'_blank'}
                    >
                      文档
                    </a>
                    <Icon icon={MoveUpRight} />
                  </Trans>
                }
                showIcon
                type={'info'}
              />
            </MobilePadding>
            <PluginPreview form={form} />
            <Segmented
              block
              onChange={(e) => {
                setConfigMode(e as any);
              }}
              options={[
                {
                  label: t('dev.manifest.mode.url'),
                  value: 'url',
                },
                {
                  disabled: true,
                  label: (
                    <Tooltip title={t('dev.manifest.mode.local-tooltip')}>
                      {t('dev.manifest.mode.local')}
                    </Tooltip>
                  ),
                  value: 'local',
                },
              ]}
            />
            {configMode === 'url' ? (
              <UrlModeForm form={form} isEditMode={mode === 'edit'} />
            ) : (
              <LocalForm form={form} mode={mode} />
            )}
            {/*<MetaForm form={form} mode={mode} />*/}
          </Flexbox>
        </Modal>
      </Form.Provider>
    );
  },
);

export default DevModal;
