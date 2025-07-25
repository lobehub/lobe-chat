'use client';

import { Alert, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ConfigDisplay from './ConfigDisplay';
import { BaseContentProps, ModalConfig, TRUSTED_MARKETPLACES, TrustedMarketplaceId } from './types';

const useStyles = createStyles(({ css, token }) => ({
  metaInfo: css`
    margin-block-end: ${token.marginXS}px;
    color: ${token.colorTextDescription};
  `,
}));

const MarketplacePluginModal = memo<BaseContentProps>(({ installRequest }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  const { schema, marketId } = installRequest;
  const marketplace = marketId ? TRUSTED_MARKETPLACES[marketId as TrustedMarketplaceId] : null;

  if (!schema) return null;

  return (
    <Flexbox gap={24}>
      {marketplace ? (
        <Alert
          message={t('protocolInstall.marketplace.trustedBy', { name: marketplace.name })}
          showIcon
          type="success"
          variant={'borderless'}
        />
      ) : (
        <Alert
          message={t('protocolInstall.marketplace.unverified.warning')}
          showIcon
          type="warning"
          variant={'borderless'}
        />
      )}
      <Flexbox gap={8}>
        <Text as={'h5'} style={{ margin: 0 }}>
          {schema.name}
        </Text>

        <Flexbox gap={12} horizontal>
          <Text className={styles.metaInfo}>{schema.author}</Text>
          <Text className={styles.metaInfo}>{schema.version}</Text>
        </Flexbox>

        <Text style={{ margin: 0 }}>{schema.description}</Text>
      </Flexbox>

      <ConfigDisplay schema={schema} />
    </Flexbox>
  );
});

// 导出配置信息
export const getMarketplaceModalConfig = (t: any): ModalConfig => ({
  okText: t('protocolInstall.actions.install'),
  title: t('protocolInstall.marketplace.title'),
  width: 520,
});

MarketplacePluginModal.displayName = 'MarketplacePluginModal';

export default MarketplacePluginModal;
