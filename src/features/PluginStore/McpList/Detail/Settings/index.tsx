import { Icon, Input, Text } from '@lobehub/ui';
import { Form as AForm, App, Button, Space, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { EditIcon, LinkIcon, SaveIcon, Settings2Icon, TerminalIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import MCPStdioCommandInput from '@/components/MCPStdioCommandInput';
import ArgsInput from '@/features/PluginDevModal/MCPManifestForm/ArgsInput';
import EnvEditor from '@/features/PluginDevModal/MCPManifestForm/EnvEditor';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const useStyles = createStyles(({ css, token }) => ({
  compactForm: css`
    .ant-form-item {
      margin-block-end: ${token.marginSM}px;
    }

    .ant-form-item-label {
      padding-block-end: ${token.paddingXXS}px;

      label {
        height: auto;
        font-size: ${token.fontSizeSM}px;
      }
    }
  `,

  configFormContainer: css`
    padding: ${token.paddingLG}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorFillAlter};
  `,

  configHeader: css`
    margin-block-end: ${token.marginLG}px;

    h5 {
      margin-block-end: ${token.marginXS}px !important;
      color: ${token.colorTextHeading};
    }
  `,

  connectionForm: css`
    padding: ${token.paddingMD}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorFillAlter};
  `,

  connectionPreview: css`
    padding: ${token.paddingMD}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorFillAlter};
  `,

  editButton: css`
    position: absolute;
    inset-block-start: ${token.paddingXS}px;
    inset-inline-end: ${token.paddingXS}px;
  `,

  emptyState: css`
    padding: ${token.paddingXL}px;
    border: 1px dashed ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;

    color: ${token.colorTextTertiary};
    text-align: center;

    background: ${token.colorFillQuaternary};
  `,

  footer: css`
    display: flex;
    gap: ${token.marginSM}px;
    margin-block-start: ${token.marginLG}px;
  `,

  markdown: css`
    p {
      margin-block-end: ${token.marginXS}px;
      color: ${token.colorTextDescription};
    }
  `,

  previewItem: css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-block: ${token.paddingXS}px;
    padding-inline: 0;

    &:not(:last-child) {
      border-block-end: 1px solid ${token.colorBorderSecondary};
    }
  `,

  previewLabel: css`
    display: flex;
    gap: ${token.marginXS}px;
    align-items: center;

    font-size: ${token.fontSizeSM}px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,

  previewValue: css`
    padding-block: ${token.paddingXXS}px;
    padding-inline: ${token.paddingXS}px;

    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;
    font-weight: 600;
    color: ${token.colorText};

    background: ${token.colorFillQuaternary};
  `,

  sectionTitle: css`
    position: relative;

    display: flex;
    gap: ${token.marginXS}px;
    align-items: center;

    height: 32px;

    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
    color: ${token.colorTextHeading};

    &::after {
      content: '';

      flex: 1;

      height: 1px;
      margin-inline-start: ${token.marginMD}px;

      background: linear-gradient(to right, ${token.colorBorder}, transparent);
    }
  `,
}));

const Settings = memo<{ identifier: string }>(({ identifier }) => {
  const { styles } = useStyles();
  const { t } = useTranslation(['plugin', 'common']);
  const [connectionForm] = AForm.useForm();
  const [envForm] = AForm.useForm();
  const [loading, setLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [isEditingConnection, setIsEditingConnection] = useState(false);

  const [updatePluginSettings, updateInstallPlugin] = useToolStore((s) => [
    s.updatePluginSettings,
    s.updateInstallMcpPlugin,
  ]);
  const { message } = App.useApp();

  // 获取已安装插件信息
  const installedPlugin = useToolStore(pluginSelectors.getInstalledPluginById(identifier));
  const pluginSettings = useToolStore(pluginSelectors.getPluginSettingsById(identifier));

  if (!installedPlugin) {
    return null;
  }

  const customParams = installedPlugin.customParams?.mcp;
  const isStdioType = customParams?.type === 'stdio';

  const handleConnectionSubmit = async (values: any) => {
    setConnectionLoading(true);
    try {
      await updateInstallPlugin(identifier!, values);

      message.success(t('settings.messages.connectionUpdateSuccess'));
      setIsEditingConnection(false);
    } catch (error) {
      console.error('Connection update failed:', error);
      message.error(t('settings.messages.connectionUpdateFailed'));
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    connectionForm.resetFields();
    setIsEditingConnection(false);
  };

  const handleEnvSubmit = async (values: { env?: Record<string, string> }) => {
    setLoading(true);
    try {
      await updatePluginSettings(identifier!, values.env || {}, { override: true });
      message.success(t('settings.messages.envUpdateSuccess'));
    } catch (error) {
      console.error('Settings update failed:', error);
      message.error(t('settings.messages.envUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flexbox paddingBlock={8} paddingInline={12}>
      <Flexbox gap={24}>
        <Flexbox gap={24}>
          <div className={styles.sectionTitle}>
            <LinkIcon size={16} />
            {t('settings.connection.title')}
            {!isEditingConnection && (
              <Button
                className={styles.editButton}
                icon={<EditIcon size={12} />}
                onClick={() => setIsEditingConnection(true)}
                size="small"
                type="text"
              >
                {t('settings.edit')}
              </Button>
            )}
          </div>

          {!isEditingConnection ? (
            // 预览模式
            <Flexbox paddingInline={8}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>{t('settings.connection.type')}</span>
                <Flexbox horizontal>
                  <Icon icon={TerminalIcon} />
                  <Text className={styles.previewValue}>
                    {customParams?.type?.toUpperCase() || 'Unknown'}
                  </Text>
                </Flexbox>
              </div>

              {customParams?.type === 'http' && customParams?.url && (
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>{t('settings.connection.url')}</span>
                  <span className={styles.previewValue}>{customParams.url}</span>
                </div>
              )}

              {customParams?.type === 'stdio' && (
                <>
                  {customParams?.command && (
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>
                        {t('settings.connection.command')}
                      </span>
                      <span className={styles.previewValue}>{customParams.command}</span>
                    </div>
                  )}

                  {customParams?.args && customParams.args.length > 0 && (
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>{t('settings.connection.args')}</span>
                      <span className={styles.previewValue}>{customParams.args.join(' ')}</span>
                    </div>
                  )}
                </>
              )}
            </Flexbox>
          ) : (
            // 编辑模式
            <div className={styles.connectionForm}>
              <AForm
                className={styles.compactForm}
                form={connectionForm}
                initialValues={customParams}
                layout="vertical"
                onFinish={handleConnectionSubmit}
              >
                {customParams?.type === 'http' && (
                  <AForm.Item
                    label={t('settings.connection.url')}
                    name={'url'}
                    rules={[{ message: t('settings.rules.urlRequired'), required: true }]}
                  >
                    <Input placeholder="https://mcp.example.com/server" size="small" />
                  </AForm.Item>
                )}

                {customParams?.type === 'stdio' && (
                  <>
                    <AForm.Item
                      label={t('settings.connection.command')}
                      name={'command'}
                      rules={[{ message: t('settings.rules.commandRequired'), required: true }]}
                    >
                      <MCPStdioCommandInput placeholder="npx, uv, python..." />
                    </AForm.Item>

                    <AForm.Item
                      label={t('settings.connection.args')}
                      name={'args'}
                      rules={[{ message: t('settings.rules.argsRequired'), required: true }]}
                    >
                      <ArgsInput placeholder="e.g: mcp-hello-world" />
                    </AForm.Item>
                  </>
                )}
                <div className={styles.footer}>
                  <Space>
                    <Button
                      htmlType="submit"
                      icon={<SaveIcon size={12} />}
                      loading={connectionLoading}
                      type="primary"
                    >
                      {t('common:save')}
                    </Button>
                    <Button onClick={handleCancelEdit}>{t('common:cancel')}</Button>
                  </Space>
                </div>
              </AForm>
            </div>
          )}
        </Flexbox>

        {/* 环境变量配置（仅 stdio 类型） */}
        {isStdioType && (
          <Flexbox gap={12}>
            <div className={styles.sectionTitle}>
              <Settings2Icon size={16} />
              {t('settings.configuration.title')}
            </div>
            <Text style={{ fontSize: 12 }} type="secondary">
              {t('settings.envConfigDescription')}
            </Text>
            <AForm
              form={envForm}
              initialValues={{ env: pluginSettings }}
              layout="vertical"
              onFinish={handleEnvSubmit}
            >
              <AForm.Item name="env" style={{ marginBottom: 0 }}>
                <EnvEditor />
              </AForm.Item>
              <div className={styles.footer}>
                <Space>
                  <Button
                    htmlType="submit"
                    icon={<SaveIcon size={14} />}
                    loading={loading}
                    type="primary"
                  >
                    {t('common:save')}
                  </Button>
                  <Button onClick={() => envForm.resetFields()}>{t('common:reset')}</Button>
                </Space>
              </div>
            </AForm>
          </Flexbox>
        )}

        {/* HTTP 类型提示 */}
        {!isStdioType && (
          <div>
            <div className={styles.sectionTitle}>
              <Settings2Icon size={16} />
              {t('settings.configuration.title')}
            </div>
            <div className={styles.emptyState}>
              <Typography.Text type="secondary">{t('settings.httpTypeNotice')}</Typography.Text>
            </div>
          </div>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default Settings;
