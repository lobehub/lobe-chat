import {
  SiBun,
  SiDocker,
  SiNodedotjs,
  SiNpm,
  SiPnpm,
  SiPython,
} from '@icons-pack/react-simple-icons';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { Alert, FormItem, Icon } from '@lobehub/ui';
import { AutoComplete, Button, Form, FormInstance, Input } from 'antd';
import { FileCode } from 'lucide-react';
import { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ManifestPreviewer from '@/components/ManifestPreviewer';
import { mcpService } from '@/services/mcp';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import ArgsInput from './ArgsInput';
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

    switch (parseResult.status) {
      case 'success': {
        const { identifier, mcpConfig } = parseResult;

        // Check for duplicate identifier (only in create mode)
        if (!isEditMode && pluginIds.includes(identifier)) {
          setPasteError(t('dev.meta.identifier.errorDuplicate', '插件 ID 重复'));
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
          customParams: {
            mcp: mcpConfig, // Spread the parsed config (includes type)
          },
          identifier: identifier,
        });

        // Clear potential old validation error on identifier
        form.setFields([{ errors: [], name: 'identifier' }]);

        break; // Success case handled
      }
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionError(null);
    setManifest(undefined); // Reset manifest before testing

    // Manually trigger validation for fields needed for the test
    let isValid = false;
    try {
      await form.validateFields([
        'identifier',
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
        if (!mcp.url) throw new Error(t('dev.mcp.url.required', '请输入 MCP 服务 URL'));
        data = await mcpService.getStreamableMcpServerManifest(id, mcp.url);
      } else if (mcp.type === 'stdio') {
        if (!mcp.command) throw new Error(t('dev.mcp.command.required', '请输入启动命令'));
        if (!mcp.args) throw new Error(t('dev.mcp.args.required', '请输入启动参数'));
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
      const errorMessage = t(
        `error.${err.message}`,
        `获取 Manifest 失败: ${err.cause || err.message || '未知错误'}`,
        { error: err.cause || err.message },
      );

      setConnectionError(errorMessage);
      // highlight-end
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Form form={form} layout={'vertical'}>
      <Flexbox>
        <Form.Item
          label={t('dev.mcp.type.title', 'MCP 服务类型')}
          name={['customParams', 'mcp', 'type']}
          rules={[{ required: true }]}
        >
          <MCPTypeSelect />
        </Form.Item>
        {/* 仅在有粘贴相关错误时显示 Alert */}
        {pasteError && (
          <Alert message={pasteError} showIcon style={{ marginBottom: 16 }} type="error" />
        )}
        <Form.Item
          extra={t('dev.mcp.identifier.desc', '插件的唯一标识符，例如 plugin-name')}
          label={t('dev.mcp.identifier.label', 'MCP 服务标识符')}
          name={'identifier'}
          rules={[
            { message: t('dev.mcp.identifier.required', '请输入 MCP 服务标识符'), required: true },
            {
              message: t('dev.mcp.identifier.invalid', '标识符只能包含字母、数字、连字符和下划线'),
              pattern: /^[\w-]+$/,
            },
            isEditMode
              ? {}
              : {
                  message: t('dev.meta.identifier.errorDuplicate', '插件 ID 重复'),
                  validator: async (_, value) => {
                    if (
                      value &&
                      pluginIds.includes(value) && // If paste error for duplicate is already showing, let it be.
                      pasteError !== t('dev.meta.identifier.errorDuplicate', '插件 ID 重复')
                    ) {
                      throw new Error(t('dev.meta.identifier.errorDuplicate', '插件 ID 重复'));
                    }
                  },
                },
          ]}
        >
          <Input
            onChange={handleIdentifierChange}
            placeholder={t('dev.mcp.identifier.placeholder', '例如 my-awesome-mcp-plugin')}
          />
        </Form.Item>

        {mcpType === 'http' && (
          <Form.Item
            extra={t('dev.mcp.url.desc', 'MCP 服务的 URL 地址')}
            label={t('dev.mcp.url.label', 'MCP 服务 URL')}
            name={HTTP_URL_KEY}
            rules={[
              { message: t('dev.mcp.url.required', '请输入 MCP 服务 URL'), required: true },
              { message: t('dev.mcp.url.invalid', '请输入有效的 URL 地址'), type: 'url' },
            ]}
          >
            <Input placeholder="https://mcp.higress.ai/mcp-github/xxxxx" />
          </Form.Item>
        )}

        {mcpType === 'stdio' && (
          <>
            <Form.Item
              extra={t('dev.mcp.command.desc', '用于启动 MCP 服务的命令行指令')}
              label={t('dev.mcp.command.label', '启动命令')}
              name={STDIO_COMMAND}
              rules={[{ message: t('dev.mcp.command.required', '请输入启动命令'), required: true }]}
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
                placeholder={t('dev.mcp.command.placeholder', '例如 python、node、docker run ...')}
              />
            </Form.Item>
            <Form.Item
              extra={t('dev.mcp.args.desc', '传递给启动命令的参数，使用空格分隔')}
              label={t('dev.mcp.args.label', '启动参数')}
              name={STDIO_ARGS}
              rules={[{ message: t('dev.mcp.args.required', '请输入启动参数'), required: true }]}
            >
              <ArgsInput
                placeholder={t('dev.mcp.args.placeholder', '例如 main.py --port {{port}}')}
              />
            </Form.Item>
          </>
        )}
        <Form.Item>
          <Flexbox align={'center'} gap={8} horizontal>
            <Button
              loading={isTesting}
              onClick={handleTestConnection}
              type={!!mcpType ? 'primary' : undefined}
            >
              {t('dev.mcp.testConnection', '测试连接')}
            </Button>
            {manifest && !connectionError && !isTesting && (
              <ManifestPreviewer manifest={manifest}>
                <Flexbox>
                  <Button icon={<Icon icon={FileCode} />}>预览插件描述文件</Button>
                </Flexbox>
              </ManifestPreviewer>
            )}
          </Flexbox>
        </Form.Item>

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
