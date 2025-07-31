import { Button, Markdown, Snippet, Text } from '@lobehub/ui';
import { Card, Space } from 'antd';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ExternalLink, Terminal } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { SystemDependencyCheckResult } from '@/types/plugins';

interface MCPDependenciesGuideProps {
  identifier: string;
  systemDependencies: SystemDependencyCheckResult[];
}

const useStyles = createStyles(({ css, token }) => ({
  commandBlock: css`
    position: relative;

    padding-block: ${token.paddingXS}px;
    padding-inline: ${token.paddingSM}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusSM}px;

    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;

    background-color: ${token.colorFillTertiary};

    &:hover {
      background-color: ${token.colorFillSecondary};
    }
  `,
  container: css`
    margin-block-start: ${token.marginXS}px;
    padding: ${token.padding}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    background-color: ${token.colorBgContainer};
  `,
  copyButton: css`
    position: absolute;
    inset-block-start: ${token.paddingXXS}px;
    inset-inline-end: ${token.paddingXXS}px;

    height: auto;
    min-height: auto;
    padding-block: 2px;
    padding-inline: 6px;

    font-size: 12px;
  `,
  dependencyCard: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusSM}px;
  `,
  footer: css`
    display: flex;
    gap: ${token.marginXS}px;
    justify-content: flex-end;
    margin-block-start: ${token.marginXS}px;
  `,
  statusIcon: css`
    display: flex;
    gap: ${token.marginXXS}px;
    align-items: center;
  `,
}));

const MCPDependenciesGuide = memo<MCPDependenciesGuideProps>(
  ({ identifier, systemDependencies }) => {
    const { styles, theme } = useStyles();
    const { t } = useTranslation(['plugin', 'common']);
    const [installMCPPlugin, cancelInstallMCPPlugin] = useToolStore((s) => [
      s.installMCPPlugin,
      s.cancelInstallMCPPlugin,
    ]);

    const handleCancel = () => {
      cancelInstallMCPPlugin(identifier);
    };

    const handleRetryCheck = async () => {
      // 重新检查依赖，重新开始安装流程
      await installMCPPlugin(identifier);
    };

    const handleSkipCheck = async () => {
      // 跳过依赖检查，继续安装流程
      await installMCPPlugin(identifier, { skipDepsCheck: true });
    };

    return (
      <motion.div
        animate={{ y: 0 }}
        className={styles.container}
        initial={{ y: 8 }}
        transition={{ delay: 0.1, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 4 }}
          style={{ marginBottom: 8 }}
          transition={{ delay: 0.15, duration: 0.2 }}
        >
          <Flexbox gap={8}>
            <Flexbox align="center" gap={8} horizontal>
              <AlertTriangle color={theme.colorWarning} size={16} />
              <Text as={'h5'} style={{ margin: 0 }}>
                {t('mcpInstall.dependenciesRequired')}
              </Text>
            </Flexbox>
            <Text style={{ fontSize: 12 }} type="secondary">
              {t('mcpInstall.dependenciesDescription')}
            </Text>
          </Flexbox>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 4 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          <Flexbox gap={8}>
            {systemDependencies.map((dep) => (
              <Card className={styles.dependencyCard} key={dep.name} size="small">
                <Flexbox gap={12}>
                  <Flexbox align="center" horizontal justify="space-between">
                    <Flexbox align="center" gap={8} horizontal>
                      <Text strong>{dep.name}</Text>
                      {dep.requiredVersion && (
                        <Text style={{ fontSize: 12 }} type="secondary">
                          {t('mcpInstall.dependencyStatus.requiredVersion', {
                            version: dep.requiredVersion,
                          })}
                        </Text>
                      )}
                    </Flexbox>
                    <div className={styles.statusIcon}>
                      {dep.meetRequirement ? (
                        <>
                          <CheckCircle color={theme.colorSuccess} size={14} />
                          <Text style={{ fontSize: 12 }} type="success">
                            {t('mcpInstall.dependencyStatus.installed')}
                          </Text>
                        </>
                      ) : (
                        <>
                          <AlertTriangle color={theme.colorWarning} size={14} />
                          <Text style={{ fontSize: 12 }} type="warning">
                            {t('mcpInstall.dependencyStatus.notInstalled')}
                          </Text>
                        </>
                      )}
                    </div>
                  </Flexbox>

                  {!dep.meetRequirement && dep.installInstructions && (
                    <Flexbox gap={12}>
                      {dep.installInstructions.current && (
                        <Flexbox gap={4}>
                          <Text strong style={{ fontSize: 12 }}>
                            <Terminal size={12} style={{ marginRight: 4 }} />
                            {t('mcpInstall.installMethods.recommended')}
                          </Text>
                          <Snippet language={'bash'}>{dep.installInstructions.current}</Snippet>
                        </Flexbox>
                      )}

                      {dep.installInstructions.manual && (
                        <Flexbox gap={4}>
                          <Text strong style={{ fontSize: 12 }}>
                            <ExternalLink size={12} style={{ marginRight: 4 }} />
                            {t('mcpInstall.installMethods.manual')}
                          </Text>
                          <Markdown style={{ fontSize: 12 }}>
                            {dep.installInstructions.manual}
                          </Markdown>
                        </Flexbox>
                      )}
                    </Flexbox>
                  )}
                </Flexbox>
              </Card>
            ))}
          </Flexbox>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.footer}
          initial={{ opacity: 0, y: 4 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        >
          <Flexbox horizontal justify={'space-between'}>
            <Button onClick={handleCancel} size="small">
              {t('common:cancel')}
            </Button>
            <Space>
              <Button onClick={handleSkipCheck} size="small">
                {t('mcpInstall.skipDependencies')}
              </Button>
              <Button onClick={handleRetryCheck} size="small" type="primary">
                {t('mcpInstall.recheckDependencies')}
              </Button>
            </Space>
          </Flexbox>
        </motion.div>
      </motion.div>
    );
  },
);

export default MCPDependenciesGuide;
