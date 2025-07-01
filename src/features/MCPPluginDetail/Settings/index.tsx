import {
  SiBun,
  SiDocker,
  SiNodedotjs,
  SiNpm,
  SiPnpm,
  SiPython,
} from '@icons-pack/react-simple-icons';
import { AutoComplete, Input } from '@lobehub/ui';
import { Form as AForm, Button, Space, Tag, Typography, message } from 'antd';
import { createStyles } from 'antd-style';
import { CpuIcon, EditIcon, LinkIcon, SaveIcon, Settings2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ArgsInput from '@/features/PluginDevModal/MCPManifestForm/ArgsInput';
import EnvEditor from '@/features/PluginDevModal/MCPManifestForm/EnvEditor';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import { useDetailContext } from '../DetailProvider';

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

  container: css`
    padding-block: ${token.paddingLG}px;
padding-inline: 0;
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
    justify-content: flex-end;

    margin-block-start: ${token.marginLG}px;
    padding-block-start: ${token.paddingMD}px;
    border-block-start: 1px solid ${token.colorBorderSecondary};
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
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusSM}px;

    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;
    font-weight: 600;
    color: ${token.colorText};

    background: ${token.colorFillQuaternary};
  `,

  section: css`
    margin-block-end: ${token.marginXL}px;

    &:last-child {
      margin-block-end: 0;
    }
  `,

  sectionTitle: css`
    position: relative;

    display: flex;
    gap: ${token.marginXS}px;
    align-items: center;

    margin-block-end: ${token.marginLG}px;

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

// 预设的命令选项
const STDIO_COMMAND_OPTIONS = [
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

const Settings = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation(['discover', 'plugin', 'common']);
  const [connectionForm] = AForm.useForm();
  const [envForm] = AForm.useForm();
  const [loading, setLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [isEditingConnection, setIsEditingConnection] = useState(false);

  const { identifier } = useDetailContext();
  const [updatePluginSettings, updateInstallPlugin] = useToolStore((s) => [
    s.updatePluginSettings,
    s.updatePluginSettings,
  ]);

  // 获取已安装插件信息
  const installedPlugin = useToolStore(pluginSelectors.getInstalledPluginById(identifier));
  const pluginSettings = useToolStore(pluginSelectors.getPluginSettingsById(identifier!));

  if (!installedPlugin) {
    return null;
  }

  const customParams = installedPlugin.customParams?.mcp;
  const isStdioType = customParams?.type === 'stdio';

  const handleConnectionSubmit = async (values: any) => {
    setConnectionLoading(true);
    try {
      const newCustomParams = {
        ...installedPlugin.customParams,
        mcp: {
          ...customParams,
          ...values.mcp,
        },
      };

      await updateInstallPlugin(identifier!, {
        ...installedPlugin,
        customParams: newCustomParams,
      });

      message.success('连接信息更新成功');
      setIsEditingConnection(false);
    } catch (error) {
      console.error('Connection update failed:', error);
      message.error('连接信息更新失败');
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
      await updatePluginSettings(identifier!, values.env || {});
      message.success('环境变量保存成功');
    } catch (error) {
      console.error('Settings update failed:', error);
      message.error('环境变量保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Flexbox gap={24}>
        {/* 连接信息配置 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <LinkIcon size={16} />
            {t('mcp.details.settings.connection.title')}
            {!isEditingConnection && (
              <Button
                className={styles.editButton}
                icon={<EditIcon size={12} />}
                onClick={() => setIsEditingConnection(true)}
                size="small"
                type="text"
              >
                编辑
              </Button>
            )}
          </div>

          {!isEditingConnection ? (
            // 预览模式
            <div className={styles.connectionPreview}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>
                  <CpuIcon size={14} />
                  连接类型
                </span>
                <Tag color={customParams?.type === 'stdio' ? 'blue' : 'green'}>
                  {customParams?.type?.toUpperCase() || 'Unknown'}
                </Tag>
              </div>

              {customParams?.type === 'http' && customParams?.url && (
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>服务地址</span>
                  <span className={styles.previewValue}>{customParams.url}</span>
                </div>
              )}

              {customParams?.type === 'stdio' && (
                <>
                  {customParams?.command && (
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>启动命令</span>
                      <span className={styles.previewValue}>{customParams.command}</span>
                    </div>
                  )}

                  {customParams?.args && customParams.args.length > 0 && (
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>启动参数</span>
                      <span className={styles.previewValue}>{customParams.args.join(' ')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // 编辑模式
            <div className={styles.connectionForm}>
              <AForm
                className={styles.compactForm}
                form={connectionForm}
                initialValues={{ mcp: customParams }}
                layout="vertical"
                onFinish={handleConnectionSubmit}
                size="small"
              >
                {customParams?.type === 'http' && (
                  <AForm.Item
                    label="服务地址"
                    name={['mcp', 'url']}
                    rules={[{ message: '请输入服务地址', required: true }]}
                  >
                    <Input placeholder="https://mcp.example.com/server" size="small" />
                  </AForm.Item>
                )}

                {customParams?.type === 'stdio' && (
                  <>
                    <AForm.Item
                      label="启动命令"
                      name={['mcp', 'command']}
                      rules={[{ message: '请输入启动命令', required: true }]}
                    >
                      <AutoComplete
                        options={STDIO_COMMAND_OPTIONS.map(({ value, icon: Icon, color }) => ({
                          label: (
                            <Flexbox align={'center'} gap={8} horizontal>
                              {Icon && <Icon color={color} size={14} />}
                              {value}
                            </Flexbox>
                          ),
                          value: value,
                        }))}
                        placeholder="npx, uv, python..."
                        size="small"
                      />
                    </AForm.Item>

                    <AForm.Item
                      label="启动参数"
                      name={['mcp', 'args']}
                      rules={[{ message: '请输入启动参数', required: true }]}
                    >
                      <ArgsInput placeholder="例如：mcp-hello-world" />
                    </AForm.Item>
                  </>
                )}

                <div className={styles.footer}>
                  <Space>
                    <Button onClick={handleCancelEdit} size="small">
                      取消
                    </Button>
                    <Button
                      htmlType="submit"
                      icon={<SaveIcon size={12} />}
                      loading={connectionLoading}
                      size="small"
                      type="primary"
                    >
                      保存
                    </Button>
                  </Space>
                </div>
              </AForm>
            </div>
          )}
        </div>

        {/* 环境变量配置（仅 stdio 类型） */}
        {isStdioType && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Settings2Icon size={16} />
              {t('mcp.details.settings.configuration.title')}
            </div>
            <div className={styles.configFormContainer}>
              <div className={styles.configHeader}>
                <Typography.Title level={5}>环境变量配置</Typography.Title>
                <Typography.Text style={{ fontSize: 12 }} type="secondary">
                  这些环境变量将在 MCP 服务器启动时传递给进程
                </Typography.Text>
              </div>

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
                    <Button onClick={() => envForm.resetFields()}>重置</Button>
                    <Button
                      htmlType="submit"
                      icon={<SaveIcon size={14} />}
                      loading={loading}
                      type="primary"
                    >
                      {t('mcp.details.settings.saveSettings')}
                    </Button>
                  </Space>
                </div>
              </AForm>
            </div>
          </div>
        )}

        {/* HTTP 类型提示 */}
        {!isStdioType && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Settings2Icon size={16} />
              {t('mcp.details.settings.configuration.title')}
            </div>
            <div className={styles.emptyState}>
              <Typography.Text type="secondary">
                HTTP 类型的 MCP 插件暂无需要配置的环境变量
              </Typography.Text>
            </div>
          </div>
        )}
      </Flexbox>
    </div>
  );
});

export default Settings;
