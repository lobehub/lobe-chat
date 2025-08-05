'use client';

import { McpInstallSchema } from '@lobechat/electron-client-ipc';
import { Alert, Block, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import PluginTag from '@/components/Plugins/PluginTag';

import ConfigDisplay from './ConfigDisplay';
import { ModalConfig, TRUSTED_MARKETPLACES, TrustedMarketplaceId } from './types';

interface MarketplacePluginModalProps {
  marketId?: string;
  onConfigUpdate?: (config: {
    env?: Record<string, string>;
    headers?: Record<string, string>;
  }) => void;
  schema?: McpInstallSchema;
  testError?: string;
}

const MarketplacePluginModal = memo<MarketplacePluginModalProps>(
  ({ schema, marketId, onConfigUpdate, testError }) => {
    const { t } = useTranslation('plugin');

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

        <Block gap={16} horizontal justify={'space-between'} padding={16} variant={'outlined'}>
          <Flexbox gap={16} horizontal>
            <PluginAvatar avatar={schema.icon} size={40} />
            <Flexbox gap={2}>
              <Flexbox align={'center'} gap={8} horizontal>
                {schema.name}
                <PluginTag type={'customPlugin'} />
              </Flexbox>
              <Text style={{ fontSize: 12 }} type={'secondary'}>
                {schema.description}
              </Text>
            </Flexbox>
          </Flexbox>
        </Block>

        <Flexbox>
          <ConfigDisplay onConfigUpdate={onConfigUpdate} schema={schema} />
          {/* 显示测试连接错误 */}
          {testError && (
            <Alert
              closable
              description={testError}
              message={t('protocolInstall.messages.connectionTestFailed')}
              showIcon
              type="error"
              variant={'filled'}
            />
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

// 导出配置信息
export const getMarketplaceModalConfig = (t: any): ModalConfig => ({
  okText: t('protocolInstall.actions.install'),
  title: t('protocolInstall.marketplace.title'),
});

MarketplacePluginModal.displayName = 'MarketplacePluginModal';

export default MarketplacePluginModal;
