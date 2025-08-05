'use client';

import { McpInstallSchema } from '@lobechat/electron-client-ipc';
import { Block, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LinkIcon, Settings2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import KeyValueEditor from '@/components/KeyValueEditor';

const useStyles = createStyles(({ css, token }) => ({
  configEditor: css`
    margin-block-start: ${token.marginSM}px;
  `,
  configSection: css`
    margin-block-end: ${token.marginLG}px;
    padding: ${token.paddingSM}px;
    border-radius: ${token.borderRadius}px;
  `,
  configTitle: css`
    display: flex;
    gap: ${token.marginXS}px;
    align-items: center;

    height: 24px;

    font-weight: 600;
    color: ${token.colorTextHeading};
  `,

  previewContainer: css`
    padding-inline: ${token.paddingXS}px;
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
    border-radius: ${token.borderRadiusSM}px;

    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;
    font-weight: 600;
    color: ${token.colorText};

    background: ${token.colorFillQuaternary};
  `,

  typeValue: css`
    display: flex;
    gap: ${token.marginXS}px;
    align-items: center;
  `,

  urlValue: css`
    max-width: 300px;
    padding-block: ${token.paddingXS}px;
    padding-inline: ${token.paddingSM}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;
    font-weight: 500;
    word-break: auto-phrase;

    background: ${token.colorBgElevated};
  `,
}));

interface ConfigDisplayProps {
  onConfigUpdate?: (updatedConfig: {
    env?: Record<string, string>;
    headers?: Record<string, string>;
  }) => void;
  schema: McpInstallSchema;
}

const ConfigDisplay = memo<ConfigDisplayProps>(({ schema, onConfigUpdate }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  // 本地状态管理配置数据
  const [currentEnv, setCurrentEnv] = useState<Record<string, string>>(schema.config.env || {});
  const [currentHeaders, setCurrentHeaders] = useState<Record<string, string>>(
    schema.config.headers || {},
  );

  // 处理环境变量更新
  const handleEnvUpdate = (newEnv: Record<string, string>) => {
    setCurrentEnv(newEnv);
    onConfigUpdate?.({ env: newEnv, headers: currentHeaders });
  };

  // 处理 Headers 更新
  const handleHeadersUpdate = (newHeaders: Record<string, string>) => {
    setCurrentHeaders(newHeaders);
    onConfigUpdate?.({ env: currentEnv, headers: newHeaders });
  };

  return (
    <Flexbox gap={16}>
      {/* 安装信息 */}
      <Block className={styles.configSection} variant={'outlined'}>
        <div className={styles.configTitle}>
          <LinkIcon size={14} />
          {t('protocolInstall.install.title', { defaultValue: '安装信息' })}
        </div>

        <div className={styles.previewContainer}>
          {/* 连接类型 */}
          <div className={styles.previewItem}>
            <span className={styles.previewLabel}>{t('protocolInstall.config.type.label')}</span>
            <div className={styles.typeValue}>
              <Text className={styles.previewValue}>
                {schema.config.type === 'stdio' ? 'STDIO' : 'HTTP'}
              </Text>
            </div>
          </div>

          {/* HTTP 类型显示 URL */}
          {schema.config.type === 'http' && schema.config.url && (
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>{t('protocolInstall.config.url')}</span>
              <div className={styles.urlValue}>{schema.config.url}</div>
            </div>
          )}

          {/* STDIO 类型显示命令和参数 */}
          {schema.config.type === 'stdio' && (
            <>
              {schema.config.command && (
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>{t('protocolInstall.config.command')}</span>
                  <span className={styles.previewValue}>{schema.config.command}</span>
                </div>
              )}

              {schema.config.args && schema.config.args.length > 0 && (
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>{t('protocolInstall.config.args')}</span>
                  <span className={styles.previewValue}>{schema.config.args.join(' ')}</span>
                </div>
              )}
            </>
          )}
        </div>
      </Block>

      {/* 配置信息 - 直接使用 KeyValueEditor */}
      <Block className={styles.configSection} variant={'outlined'}>
        <div className={styles.configTitle}>
          <Settings2Icon size={14} />
          {schema.config.type === 'stdio'
            ? t('protocolInstall.config.env', { defaultValue: '环境变量' })
            : t('protocolInstall.config.headers', { defaultValue: '请求头' })}
        </div>

        <div className={styles.configEditor}>
          {/* HTTP 类型显示 Headers */}
          {schema.config.type === 'http' && (
            <KeyValueEditor
              addButtonText={t('protocolInstall.config.addHeaders', { defaultValue: '添加请求头' })}
              onChange={handleHeadersUpdate}
              style={{ border: 'none' }}
              value={currentHeaders}
            />
          )}

          {/* STDIO 类型显示环境变量 */}
          {schema.config.type === 'stdio' && (
            <KeyValueEditor
              addButtonText={t('protocolInstall.config.addEnv', { defaultValue: '添加环境变量' })}
              onChange={handleEnvUpdate}
              style={{ border: 'none' }}
              value={currentEnv}
            />
          )}
        </div>
      </Block>
    </Flexbox>
  );
});

ConfigDisplay.displayName = 'ConfigDisplay';

export default ConfigDisplay;
