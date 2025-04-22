import {
  SiBun,
  SiDocker,
  SiNodedotjs,
  SiNpm,
  SiPnpm,
  SiPython,
} from '@icons-pack/react-simple-icons';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { ActionIcon, FormItem } from '@lobehub/ui';
import { AutoComplete, Form, FormInstance, Input } from 'antd';
import { FileCode, RotateCwIcon } from 'lucide-react';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ManifestPreviewer from '@/components/ManifestPreviewer';
import { mcpService } from '@/services/mcp';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { PluginInstallError } from '@/types/tool/plugin';

import ArgsInput from './ArgsInput';
import MCPTypeSelect from './MCPTypeSelect';

interface MCPManifestFormProps {
  form: FormInstance;
  isEditMode?: boolean;
}

// 定义预设的命令选项
const STDIO_COMMAND_OPTIONS: {
  // 假设图标是 React 函数组件
  color?: string;
  icon?: FC<{ color?: string; size?: number }>;
  value: string;
}[] = [
  { color: '#CB3837', icon: SiNpm, value: 'npx' },
  { color: '#CB3837', icon: SiNpm, value: 'npm' },
  { color: '#F69220', icon: SiPnpm, value: 'pnpm' },
  { color: '#F69220', icon: SiPnpm, value: 'pnpx' },
  { color: '#339933', icon: SiNodedotjs, value: 'node' },
  { color: '#efe2d2', icon: SiBun, value: 'bun' },
  { color: '#efe2d2', icon: SiBun, value: 'bunx' },
  { color: '#DE5FE9', icon: SiPython, value: 'uv' },
  { color: '#3776AB', icon: SiPython, value: 'python' },
  { color: '#2496ED', icon: SiDocker, value: 'docker' },
];

const MCPManifestForm = ({ form, isEditMode }: MCPManifestFormProps) => {
  const { t } = useTranslation('plugin');
  const mcpType = Form.useWatch(['customParams', 'mcp', 'type'], form);
  const [manifest, setManifest] = useState<LobeChatPluginManifest>();
  const pluginIds = useToolStore(pluginSelectors.storeAndInstallPluginsIdList);

  const HTTP_URL_KEY = ['customParams', 'mcp', 'url'];
  const STDIO_COMMAND = ['customParams', 'mcp', 'command'];
  const STDIO_ARGS = ['customParams', 'mcp', 'args'];
  return (
    <Form form={form} layout={'vertical'}>
      <Flexbox>
        <Form.Item
          label={t('dev.mcp.type.title')}
          name={['customParams', 'mcp', 'type']}
          rules={[{ required: true }]}
        >
          <MCPTypeSelect />
        </Form.Item>
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
              name={STDIO_COMMAND}
              rules={[{ required: true }]}
            >
              <AutoComplete
                options={STDIO_COMMAND_OPTIONS.map(({ value, icon: Icon, color }) => ({
                  label: (
                    <Flexbox align={'center'} gap={8} horizontal>
                      {Icon && <Icon color={color} size={16} />}
                      {value}
                    </Flexbox>
                  ),
                  value: value,
                }))}
                placeholder={t('dev.mcp.command.placeholder')}
              />
            </Form.Item>
            <Form.Item
              extra={t('dev.mcp.args.desc')}
              hasFeedback
              label={t('dev.mcp.args.label')}
              name={STDIO_ARGS}
              rules={[
                { required: true },
                {
                  validator: async (_, value) => {
                    if (!value) return true;
                    const name = form.getFieldValue('identifier');

                    if (!name) throw new Error('Please input mcp server name');
                    try {
                      const data = await mcpService.getStdioMcpServerManifest(
                        name,
                        form.getFieldValue(STDIO_COMMAND),
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
              <ArgsInput
                placeholder={t('dev.mcp.args.placeholder')}
                suffix={
                  <ActionIcon
                    icon={RotateCwIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      form.validateFields([STDIO_ARGS]);
                    }}
                    size={'small'}
                    title={t('dev.meta.manifest.refresh')}
                  />
                }
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
