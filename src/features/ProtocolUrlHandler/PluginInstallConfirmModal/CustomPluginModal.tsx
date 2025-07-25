'use client';

import { Alert, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ConfigDisplay from './ConfigDisplay';
import { BaseContentProps, ModalConfig } from './types';

const useStyles = createStyles(({ css, token }) => ({
  metaInfo: css`
    margin-block-end: ${token.marginXS}px;
    color: ${token.colorTextDescription};
  `,
}));

const CustomPluginModal = memo<BaseContentProps>(({ installRequest }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  const { schema } = installRequest;

  if (!schema) return null;

  return (
    <Flexbox gap={24}>
      <Alert
        message={t('protocolInstall.custom.security.description')}
        showIcon
        type="warning"
        variant={'borderless'}
      />
      <Flexbox gap={8}>
        <Text as={'h5'} style={{ margin: 0 }}>
          {schema.name}
        </Text>

        <Flexbox gap={12} horizontal>
          <Text className={styles.metaInfo}>{schema.author}</Text>
          <Text className={styles.metaInfo}>{schema.version}</Text>
          {schema.homepage && (
            <Text className={styles.metaInfo}>
              {t('protocolInstall.meta.homepage')}: {schema.homepage}
            </Text>
          )}
        </Flexbox>

        <Text style={{ margin: 0 }}>{schema.description}</Text>
      </Flexbox>

      <ConfigDisplay schema={schema} />
    </Flexbox>
  );
});

// 导出配置信息
export const getCustomModalConfig = (t: any): ModalConfig => ({
  okText: t('protocolInstall.actions.installAnyway'),
  title: t('protocolInstall.custom.title'),
  width: 560,
});

CustomPluginModal.displayName = 'CustomPluginModal';

export default CustomPluginModal;
