import { Alert, Icon, Modal, Tooltip } from '@lobehub/ui';
import { App, Button, Form, Popconfirm, Segmented } from 'antd';
import { useResponsive } from 'antd-style';
import { MoveUpRight } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { WIKI_PLUGIN_GUIDE } from '@/const/url';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import PluginPreview from './PluginPreview';
import UrlManifestForm from './UrlManifestForm';

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
    const [submitting, setSubmitting] = useState(false);
    const { mobile } = useResponsive();
    const [form] = Form.useForm();
    useEffect(() => {
      form.setFieldsValue(value);
    }, []);

    const buttonStyle = mobile ? { flex: 1 } : { margin: 0 };

    const footer = (
      <Flexbox flex={1} gap={12} horizontal justify={'flex-end'}>
        {isEditMode ? (
          <Popconfirm
            arrow={false}
            cancelText={t('cancel', { ns: 'common' })}
            okButtonProps={{
              danger: true,
              type: 'primary',
            }}
            okText={t('ok', { ns: 'common' })}
            onConfirm={() => {
              onDelete?.();
              message.success(t('dev.deleteSuccess'));
            }}
            placement={'topLeft'}
            title={t('dev.confirmDeleteDevPlugin')}
          >
            <Button danger style={buttonStyle}>
              {t('delete', { ns: 'common' })}
            </Button>
          </Popconfirm>
        ) : null}
        <Button
          onClick={() => {
            onOpenChange(false);
          }}
          style={buttonStyle}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
        <Button
          loading={submitting}
          onClick={() => {
            form.submit();
          }}
          style={buttonStyle}
          type={'primary'}
        >
          {t(isEditMode ? 'dev.update' : 'dev.save')}
        </Button>
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
          allowFullscreen
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
          title={t(isEditMode ? 'dev.title.edit' : 'dev.title.create')}
        >
          <Flexbox
            gap={16}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
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
              <UrlManifestForm form={form} isEditMode={mode === 'edit'} />
            ) : null}
            <PluginPreview form={form} />
          </Flexbox>
        </Modal>
      </Form.Provider>
    );
  },
);

export default DevModal;
