import {
  SiBun,
  SiDocker,
  SiNodedotjs,
  SiNpm,
  SiPnpm,
  SiPython,
} from '@icons-pack/react-simple-icons';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { Alert, AutoComplete, Button, FormItem, Icon, Input } from '@lobehub/ui';
import { Form, FormInstance } from 'antd';
import { FileCode } from 'lucide-react';
import { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ManifestPreviewer from '@/components/ManifestPreviewer';
import { isDesktop } from '@/const/version';
import { mcpService } from '@/services/mcp';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import ArgsInput from './ArgsInput';
import EnvEditor from './EnvEditor';
import MCPTypeSelect from './MCPTypeSelect';
import { parseMcpInput } from './utils';

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

const HTTP_URL_KEY = ['customParams', 'mcp', 'url'];
const STDIO_COMMAND = ['customParams', 'mcp', 'command'];
const STDIO_ARGS = ['customParams', 'mcp', 'args'];
const STDIO_ENV = ['customParams', 'mcp', 'env'];
const MCP_TYPE = ['customParams', 'mcp', 'type'];

const MCPManifestForm = ({ form, isEditMode }: MCPManifestFormProps) => {
  const { t } = useTranslation('plugin');
  const mcpType = Form.useWatch(MCP_TYPE, form);
  const [manifest, setManifest] = useState<LobeChatPluginManifest>();
  const pluginIds = useToolStore(pluginSelectors.storeAndInstallPluginsIdList);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setPasteError(null); // Clear previous errors on new input
    setConnectionError(null); // Clear connection error on identifier change

    const parseResult = parseMcpInput(value);

    if (parseResult.status !== 'success') return;

    const { identifier, mcpConfig } = parseResult;

    if (!isDesktop && mcpConfig.type === 'stdio') {
      return;
    }

    // Check for duplicate identifier (only in create mode)
    if (!isEditMode && pluginIds.includes(identifier)) {
      setPasteError(t('dev.meta.identifier.errorDuplicate'));
      // Update form fields even if duplicate, so user sees the pasted values
      form.setFieldsValue({
        // Update identifier field
        customParams: {
          mcp: mcpConfig, // Spread the parsed config (includes type)
        },
        identifier: identifier,
      });
      // Trigger validation to show Form.Item error
      form.validateFields(['identifier']);
      return;
    }

    // No duplicate or in edit mode, fill the form
    form.setFieldsValue({
      customParams: { mcp: mcpConfig },
      identifier: identifier,
    });

    // Clear potential old validation error on identifier
    form.setFields([{ errors: [], name: 'identifier' }]);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionError(null);
    setManifest(undefined); // Reset manifest before testing

    // Manually trigger validation for fields needed for the test
    let isValid = false;
    try {
      await form.validateFields([
        ...(mcpType === 'http' ? [HTTP_URL_KEY] : [STDIO_COMMAND, STDIO_ARGS]),
      ]);
      isValid = true;
    } catch {}

    if (!isValid) {
      setIsTesting(false);
      return;
    }

    try {
      const values = form.getFieldsValue();
      const id = values.identifier;
      const mcp = values.customParams?.mcp;

      let data: LobeChatPluginManifest;

      if (mcp.type === 'http') {
        if (!mcp.url) throw new Error(t('dev.mcp.url.required'));
        data = await mcpService.getStreamableMcpServerManifest(id, mcp.url);
      } else if (mcp.type === 'stdio') {
        if (!mcp.command) throw new Error(t('dev.mcp.command.required'));
        if (!mcp.args) throw new Error(t('dev.mcp.args.required'));
        data = await mcpService.getStdioMcpServerManifest(id, mcp.command, mcp.args);
      } else {
        throw new Error('Invalid MCP type'); // Internal error
      }

      setManifest(data);
      // Optionally update form if manifest ID differs or to store the fetched manifest
      // Be careful about overwriting user input if not desired
      form.setFieldsValue({ manifest: data });
    } catch (error) {
      // Check if error is a validation error object (from validateFields)

      // Handle API call errors or other errors
      const err = error as Error; // Assuming PluginInstallError or similar structure
      // Use the error message directly if it's a simple string error, otherwise try translation
      // highlight-start
      const errorMessage = t('error.testConnectionFailed', {
        error: err.cause || err.message || t('unknownError'),
      });
      // highlight-end

      setConnectionError(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

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
        {/* 仅在有粘贴相关错误时显示 Alert */}
        {pasteError && (
          <Alert message={pasteError} showIcon style={{ marginBottom: 16 }} type="error" />
        )}
        <FormItem
          desc={t('dev.mcp.identifier.desc')}
          label={t('dev.mcp.identifier.label')}
          name={'identifier'}
          rules={[
            { message: t('dev.mcp.identifier.required'), required: true },
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
          tag={'identifier'}
        >
          <Input
            onChange={handleIdentifierChange}
            placeholder={t('dev.mcp.identifier.placeholder')}
          />
        </FormItem>

        {mcpType === 'http' && (
          <FormItem
            desc={t('dev.mcp.url.desc')}
            label={t('dev.mcp.url.label')}
            name={HTTP_URL_KEY}
            rules={[
              { message: t('dev.mcp.url.required'), required: true },
              { message: t('dev.mcp.url.invalid'), type: 'url' },
            ]}
            tag={'url'}
          >
            <Input placeholder="https://mcp.higress.ai/mcp-github/xxxxx" />
          </FormItem>
        )}

        {mcpType === 'stdio' && (
          <>
            <FormItem
              desc={t('dev.mcp.command.desc')}
              label={t('dev.mcp.command.label')}
              name={STDIO_COMMAND}
              rules={[{ message: t('dev.mcp.command.required'), required: true }]}
              tag={'command'}
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
            </FormItem>
            <FormItem
              desc={t('dev.mcp.args.desc')}
              label={t('dev.mcp.args.label')}
              name={STDIO_ARGS}
              rules={[{ message: t('dev.mcp.args.required'), required: true }]}
              tag={'args'}
            >
              <ArgsInput placeholder={t('dev.mcp.args.placeholder')} />
            </FormItem>
            <FormItem
              extra={t('dev.mcp.env.desc')}
              label={t('dev.mcp.env.label')}
              name={STDIO_ENV}
              tag={'env'}
            >
              <EnvEditor />
            </FormItem>
          </>
        )}
        <FormItem colon={false} label={t('dev.mcp.testConnectionTip')} layout={'horizontal'}>
          <Flexbox align={'center'} gap={8} horizontal justify={'flex-end'}>
            {manifest && !connectionError && !isTesting && (
              <ManifestPreviewer manifest={manifest}>
                <Flexbox>
                  <Button icon={<Icon icon={FileCode} />}>{t('dev.mcp.previewManifest')}</Button>
                </Flexbox>
              </ManifestPreviewer>
            )}
            <Button
              loading={isTesting}
              onClick={handleTestConnection}
              type={!!mcpType ? 'primary' : undefined}
            >
              {t('dev.mcp.testConnection')}
            </Button>
          </Flexbox>
        </FormItem>

        {connectionError && (
          <Alert
            closable
            message={connectionError}
            onClose={() => setConnectionError(null)}
            showIcon
            style={{ marginBottom: 16 }}
            type="error"
          />
        )}
        <FormItem name={'manifest'} noStyle />
      </Flexbox>
    </Form>
  );
};

export default MCPManifestForm;
