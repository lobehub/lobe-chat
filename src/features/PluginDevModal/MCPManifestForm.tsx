import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { ActionIcon, FormItem } from '@lobehub/ui';
import { Form, FormInstance, Input, Radio, Select } from 'antd';
import { FileCode, RotateCwIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ManifestPreviewer from '@/components/ManifestPreviewer';
import { isDesktop } from '@/const/version';
import { mcpService } from '@/services/mcp';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { PluginInstallError } from '@/types/tool/plugin';

interface MCPManifestFormProps {
  form: FormInstance;
  isEditMode?: boolean;
}

const MCPManifestForm = ({ form, isEditMode }: MCPManifestFormProps) => {
  const { t } = useTranslation('plugin');
  const mcpType = Form.useWatch(['customParams', 'mcp', 'type'], form);
  const [manifest, setManifest] = useState<LobeChatPluginManifest>();
  const pluginIds = useToolStore(pluginSelectors.storeAndInstallPluginsIdList);

  const HTTP_URL_KEY = ['customParams', 'mcp', 'url'];
  return (
    <Form form={form} layout={'vertical'}>
      <Flexbox gap={16}>
        <Form.Item
          extra={t('dev.mcp.identifier.desc')}
          label={t('dev.mcp.identifier.label')}
          name={'identifier'}
          rules={[
            { required: true },
            {
              message: t('dev.mcp.identifier.invalid'),
              pattern: /^[\w-]+$/,
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
        >
          <Input placeholder={t('dev.mcp.identifier.placeholder')} />
        </Form.Item>

        <Form.Item
          extra={t('dev.mcp.type.desc')}
          initialValue={'http'}
          label={t('dev.mcp.type.label')}
          name={['customParams', 'mcp', 'type']}
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value={'http'}>Streamable HTTP</Radio>
            <Radio disabled={!isDesktop} value={'stdio'}>
              STDIO
            </Radio>
          </Radio.Group>
        </Form.Item>

        {mcpType === 'http' && (
          <Form.Item
            extra={
              <Flexbox horizontal justify={'space-between'} style={{ marginTop: 8 }}>
                {t('dev.mcp.url.desc')}
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
            label={t('dev.mcp.url.label')}
            name={HTTP_URL_KEY}
            rules={[
              { required: true },
              { type: 'url' },
              {
                validator: async (_, value) => {
                  if (!value) return true;

                  try {
                    const data = await mcpService.getStreamableMcpServerManifest(
                      form.getFieldValue('identifier'),
                      value,
                    );
                    setManifest(data);

                    form.setFieldsValue({ identifier: data.identifier, manifest: data });
                  } catch (error) {
                    const err = error as PluginInstallError;
                    throw t(`error.${err.message}`, { error: err.cause! });
                  }
                },
              },
            ]}
          >
            <Input
              placeholder="https://mcp.higress.ai/mcp-github/xxxxx"
              suffix={
                <ActionIcon
                  icon={RotateCwIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    form.validateFields([HTTP_URL_KEY]);
                  }}
                  size={'small'}
                  title={t('dev.meta.manifest.refresh')}
                />
              }
            />
          </Form.Item>
        )}

        {mcpType === 'stdio' && (
          <>
            <Form.Item
              extra={t('dev.mcp.command.desc')}
              label={t('dev.mcp.command.label')}
              name={['mcp', 'command']}
              rules={[{ required: true }]}
            >
              <Input placeholder={t('dev.mcp.command.placeholder')} />
            </Form.Item>
            <Form.Item
              extra={t('dev.mcp.args.desc')}
              label={t('dev.mcp.args.label')}
              name={['mcp', 'args']}
              tooltip={t('dev.mcp.args.tooltip')}
            >
              <Select
                mode="tags"
                placeholder={t('dev.mcp.args.placeholder')}
                tokenSeparators={[',', ' ']}
              />
            </Form.Item>
          </>
        )}
        <FormItem name={'manifest'} noStyle />
      </Flexbox>
    </Form>
  );
};

export default MCPManifestForm;
