'use client';

import { McpInstallSchema } from '@lobechat/electron-client-ipc';
import { Block, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LinkIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
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
    margin-block-end: ${token.marginMD}px;

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
  schema: McpInstallSchema;
}

const ConfigDisplay = memo<ConfigDisplayProps>(({ schema }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  return (
    <Block className={styles.configSection} variant={'outlined'}>
      <div className={styles.configTitle}>
        <LinkIcon size={14} />
        {t('protocolInstall.config.title')}
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
  );
});

ConfigDisplay.displayName = 'ConfigDisplay';

export default ConfigDisplay;
