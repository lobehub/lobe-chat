import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { ActionIcon, FormItem, Input } from '@lobehub/ui';
import { Form, FormInstance } from 'antd';
import { FileCode, RotateCwIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ManifestPreviewer from '@/components/ManifestPreviewer';
import { pluginService } from '@/services/plugin';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { PluginInstallError } from '@/types/tool/plugin';

const UrlManifestForm = memo<{ form: FormInstance; isEditMode: boolean }>(
  ({ form, isEditMode }) => {
    const { t } = useTranslation('plugin');

    const [manifest, setManifest] = useState<LobeChatPluginManifest>();

    const urlKey = ['customParams', 'manifestUrl'];
    const pluginIds = useToolStore(pluginSelectors.storeAndInstallPluginsIdList);

    return (
      <Form form={form} layout={'vertical'}>
        <FormItem
          extra={
            <Flexbox horizontal justify={'space-between'} style={{ marginTop: 8 }}>
              {t('dev.meta.manifest.desc')}
              {manifest && (
                <ManifestPreviewer manifest={manifest}>
                  <ActionIcon
                    icon={FileCode}
                    size={'small'}
                    title={t('dev.meta.manifest.preview')}
                  />
                </ManifestPreviewer>
              )}
            </Flexbox>
          }
          hasFeedback
          label={t('dev.meta.manifest.label')}
          name={urlKey}
          required
          rules={[
            { required: true },
            {
              message: t('error.urlError'),
              pattern: /^https?:\/\/.*/,
            },
            {
              validator: async (_, value) => {
                if (!value) return true;

                try {
                  const data = await pluginService.getPluginManifest(value);
                  setManifest(data);

                  form.setFieldsValue({ identifier: data.identifier, manifest: data });
                } catch (error) {
                  const err = error as PluginInstallError;
                  throw t(`error.${err.message}`, { error: err.cause! });
                }
              },
            },
            // 编辑模式下，不进行重复校验
            isEditMode
              ? {}
              : {
                  message: t('dev.meta.identifier.errorDuplicate'),
                  validator: async () => {
                    const id = form.getFieldValue('identifier');
                    if (!id) return true;

                    if (pluginIds.includes(id)) {
                      throw new Error('Duplicate');
                    }
                  },
                },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Input
            placeholder={'http://localhost:3400/manifest-dev.json'}
            suffix={
              <ActionIcon
                icon={RotateCwIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  form.validateFields([urlKey, 'identifier']);
                }}
                size={'small'}
                title={t('dev.meta.manifest.refresh')}
              />
            }
          />
        </FormItem>
        <FormItem name={'identifier'} noStyle />
        <FormItem name={'manifest'} noStyle />
      </Form>
    );
  },
);

export default UrlManifestForm;
