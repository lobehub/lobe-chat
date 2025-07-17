import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { Alert, FormItem, Input, InputPassword } from '@lobehub/ui';
import { Button, Divider, Form, FormInstance, Radio } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import KeyValueEditor from '@/components/KeyValueEditor';
import MCPStdioCommandInput from '@/components/MCPStdioCommandInput';
import { mcpService } from '@/services/mcp';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import ArgsInput from './ArgsInput';
import CollapsibleSection from './CollapsibleSection';
import MCPTypeSelect from './MCPTypeSelect';
import QuickImportSection from './QuickImportSection';

interface MCPManifestFormProps {
  form: FormInstance;
  isEditMode?: boolean;
}

const HTTP_URL_KEY = ['customParams', 'mcp', 'url'];
const STDIO_COMMAND = ['customParams', 'mcp', 'command'];
const STDIO_ARGS = ['customParams', 'mcp', 'args'];
const STDIO_ENV = ['customParams', 'mcp', 'env'];
const MCP_TYPE = ['customParams', 'mcp', 'type'];
const DESC_TYPE = ['customParams', 'description'];
// 新增认证相关常量
const AUTH_TYPE = ['customParams', 'mcp', 'auth', 'type'];
const AUTH_TOKEN = ['customParams', 'mcp', 'auth', 'token'];
// 新增 headers 相关常量
const HEADERS = ['customParams', 'mcp', 'headers'];

const MCPManifestForm = ({ form, isEditMode }: MCPManifestFormProps) => {
  const { t } = useTranslation('plugin');
  const mcpType = Form.useWatch(MCP_TYPE, form);
  const authType = Form.useWatch(AUTH_TYPE, form);

  const pluginIds = useToolStore(pluginSelectors.storeAndInstallPluginsIdList);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionError(null);

    // Manually trigger validation for fields needed for the test
    let isValid = false;
    try {
      const fieldsToValidate = [
        ...(mcpType === 'http' ? [HTTP_URL_KEY] : [STDIO_COMMAND, STDIO_ARGS]),
      ];

      // 如果是 HTTP 类型，还需要验证认证字段
      if (mcpType === 'http') {
        fieldsToValidate.push(AUTH_TYPE);
        const currentAuthType = form.getFieldValue(AUTH_TYPE);
        if (currentAuthType === 'bearer') {
          fieldsToValidate.push(AUTH_TOKEN);
        }
      }

      await form.validateFields(fieldsToValidate);
      isValid = true;
    } catch {
      // no-thing
    }

    if (!isValid) {
      setIsTesting(false);
      return;
    }

    try {
      const values = form.getFieldsValue();
      const id = values.identifier;
      const mcp = values.customParams?.mcp;
      const description = values.customParams?.description;
      const avatar = values.customParams?.avatar;

      let data: LobeChatPluginManifest;

      if (mcp.type === 'http') {
        if (!mcp.url) throw new Error(t('dev.mcp.url.required'));
        data = await mcpService.getStreamableMcpServerManifest({
          auth: mcp.auth,
          headers: mcp.headers,
          identifier: id,
          metadata: { avatar, description },
          url: mcp.url,
        });
      } else if (mcp.type === 'stdio') {
        if (!mcp.command) throw new Error(t('dev.mcp.command.required'));
        if (!mcp.args) throw new Error(t('dev.mcp.args.required'));
        data = await mcpService.getStdioMcpServerManifest(
          { ...mcp, name: id },
          { avatar, description },
        );
      } else {
        throw new Error('Invalid MCP type'); // Internal error
      }

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
    <>
      <QuickImportSection
        form={form}
        isEditMode={isEditMode}
        onClearConnectionError={() => setConnectionError(null)}
      />
      <Form form={form} layout={'vertical'}>
        <Flexbox>
          <Form.Item
            initialValue={'http'}
            label={t('dev.mcp.type.title')}
            name={['customParams', 'mcp', 'type']}
            rules={[{ required: true }]}
          >
            <MCPTypeSelect />
          </Form.Item>
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
            <Input placeholder={t('dev.mcp.identifier.placeholder')} />
          </FormItem>
          {mcpType === 'http' && (
            <>
              <FormItem
                desc={t('dev.mcp.url.desc')}
                label={t('dev.mcp.url.label')}
                name={HTTP_URL_KEY}
                rules={[
                  { message: t('dev.mcp.url.required'), required: true },
                  {
                    message: t('dev.mcp.url.invalid'),
                    validator: async (_, value) => {
                      if (!value) return true;

                      // 如果不是 URL 就会自动抛出错误
                      new URL(value);
                    },
                  },
                ]}
                tag={'url'}
              >
                <Input placeholder="https://mcp.higress.ai/mcp-github/xxxxx" />
              </FormItem>
              <FormItem
                desc={t('dev.mcp.auth.desc')}
                initialValue={'none'}
                label={t('dev.mcp.auth.label')}
                name={AUTH_TYPE}
              >
                <Radio.Group
                  options={[
                    {
                      label: t('dev.mcp.auth.none'),
                      value: 'none',
                    },
                    {
                      label: t('dev.mcp.auth.bear'),
                      value: 'bearer',
                    },
                  ]}
                  style={{ width: '100%' }}
                />
              </FormItem>
              {authType === 'bearer' && (
                <FormItem
                  desc={t('dev.mcp.auth.token.desc')}
                  label={t('dev.mcp.auth.token.label')}
                  name={AUTH_TOKEN}
                  rules={[{ message: t('dev.mcp.auth.token.required'), required: true }]}
                >
                  <InputPassword placeholder={t('dev.mcp.auth.token.placeholder')} />
                </FormItem>
              )}
              <CollapsibleSection title={t('dev.mcp.advanced.title')}>
                <FormItem
                  desc={t('dev.mcp.headers.desc')}
                  label={t('dev.mcp.headers.label')}
                  name={HEADERS}
                >
                  <KeyValueEditor addButtonText={t('dev.mcp.headers.add')} />
                </FormItem>
              </CollapsibleSection>
            </>
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
                <MCPStdioCommandInput placeholder={t('dev.mcp.command.placeholder')} />
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
                <KeyValueEditor
                  addButtonText={t('dev.mcp.env.add')}
                  keyPlaceholder="VARIABLE_NAME"
                />
              </FormItem>
            </>
          )}
          <FormItem colon={false} label={t('dev.mcp.testConnectionTip')} layout={'horizontal'}>
            <Flexbox align={'center'} gap={8} horizontal justify={'flex-end'}>
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
          <Divider />
          <FormItem
            desc={t('dev.mcp.desc.desc')}
            label={t('dev.mcp.desc.label')}
            name={DESC_TYPE}
            tag={'description'}
          >
            <Input placeholder={t('dev.mcp.desc.placeholder')} />
          </FormItem>
          <FormItem
            label={t('dev.mcp.avatar.label')}
            name={['customParams', 'avatar']}
            tag={'avatar'}
          >
            <Input placeholder={'https://plugin-avatar.com'} />
          </FormItem>
        </Flexbox>
      </Form>
    </>
  );
};

export default MCPManifestForm;
