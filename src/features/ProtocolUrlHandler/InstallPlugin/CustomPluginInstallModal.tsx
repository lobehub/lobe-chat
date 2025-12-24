'use client';

import { Alert, Block, Modal, Text } from '@lobehub/ui';
import { App } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import PluginTag from '@/components/Plugins/PluginTag';
import { useAgentStore } from '@/store/agent';
import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { McpConnectionParams } from '@/types/plugins';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import ConfigDisplay from './ConfigDisplay';
import { McpInstallRequest, TRUSTED_MARKETPLACES, TrustedMarketplaceId } from './types';

interface CustomPluginInstallModalProps {
  installRequest: McpInstallRequest | null;
  isMarketplace?: boolean;
  onComplete?: () => void;
}

const CustomPluginInstallModal = memo<CustomPluginInstallModalProps>(
  ({ installRequest, isMarketplace = false, onComplete }) => {
    const { message } = App.useApp();
    const { t } = useTranslation('plugin');
    const [loading, setLoading] = useState(false);

    // Track configuration updates
    const [updatedConfig, setUpdatedConfig] = useState<{
      env?: Record<string, string>;
      headers?: Record<string, string>;
    }>({});

    const [installCustomPlugin] = useToolStore((s) => [s.installCustomPlugin]);
    const testMcpConnection = useToolStore((s) => s.testMcpConnection);
    const togglePlugin = useAgentStore((s) => s.togglePlugin);

    // Generate unique identifier for custom plugin connection testing
    const identifier = installRequest?.schema?.identifier || '';
    const testState = useToolStore(mcpStoreSelectors.getMCPConnectionTestState(identifier));

    const schema = installRequest?.schema;
    const marketId = installRequest?.marketId;
    const marketplace =
      isMarketplace && marketId ? TRUSTED_MARKETPLACES[marketId as TrustedMarketplaceId] : null;

    // Reset loading state and configuration
    useEffect(() => {
      if (!installRequest) {
        setLoading(false);
        setUpdatedConfig({});
      }
    }, [installRequest]);

    const handleConfirm = useCallback(async () => {
      if (!installRequest || !schema) return;

      setLoading(true);
      try {
        // Third-party marketplace and custom plugins: build custom plugin data
        let customPlugin: LobeToolCustomPlugin;

        // Merge original configuration with user-updated configuration
        const finalConfig = {
          ...schema.config,
          env: updatedConfig.env || schema.config.env,
          headers: updatedConfig.headers || schema.config.headers,
        };

        // Custom plugin: test connection first to get the actual manifest
        const testParams: McpConnectionParams = {
          connection: finalConfig,
          identifier: identifier,
          metadata: {
            avatar: schema.icon,
            description: schema.description,
          },
        };
        console.log('testParams:', testParams);

        const testResult = await testMcpConnection(testParams);

        if (!testResult.success) {
          throw new Error(testResult.error || t('protocolInstall.messages.connectionTestFailed'));
        }

        if (!testResult.manifest) {
          throw new Error(t('protocolInstall.messages.manifestNotFound'));
        }

        // Use the actual manifest obtained from connection test
        customPlugin = {
          customParams: {
            avatar: schema.icon,
            description: schema.description,
            mcp: {
              ...finalConfig, // Use merged configuration
              headers: finalConfig.type === 'http' ? finalConfig.headers : undefined,
            },
          },
          identifier: schema.identifier,
          manifest: testResult.manifest, // Use the actual manifest
          type: 'customPlugin',
        };

        await installCustomPlugin(customPlugin);
        await togglePlugin(schema.identifier);
        message.success(t('protocolInstall.messages.installSuccess', { name: schema.name }));

        onComplete?.();
      } catch (error) {
        console.error('Plugin installation error:', error);
        message.error(t('protocolInstall.messages.installError'));
        setLoading(false);
      }
    }, [
      installRequest,
      schema,
      updatedConfig,
      onComplete,
      installCustomPlugin,
      testMcpConnection,
      togglePlugin,
      message,
      t,
      identifier,
    ]);

    const handleCancel = useCallback(() => {
      onComplete?.();
    }, [onComplete]);

    if (!installRequest || !schema) return null;

    // 根据类型渲染不同的 Alert 组件
    const renderAlert = () => {
      if (!isMarketplace) {
        return (
          <Alert
            message={t('protocolInstall.custom.security.description')}
            showIcon
            type="warning"
            variant={'borderless'}
          />
        );
      }

      // marketplace 类型
      return marketplace ? (
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
      );
    };

    const modalTitle = isMarketplace
      ? t('protocolInstall.marketplace.title')
      : t('protocolInstall.custom.title');

    const okText = isMarketplace
      ? t('protocolInstall.actions.install')
      : t('protocolInstall.actions.installAnyway');

    return (
      <Modal
        confirmLoading={loading || testState.loading}
        okText={okText}
        onCancel={handleCancel}
        onOk={handleConfirm}
        open
        title={modalTitle}
        width={680}
      >
        <Flexbox gap={24}>
          {renderAlert()}

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
            <ConfigDisplay onConfigUpdate={setUpdatedConfig} schema={schema} />
            {/* 显示测试连接错误 */}
            {testState.error && (
              <Alert
                closable
                description={testState.error}
                message={t('protocolInstall.messages.connectionTestFailed')}
                showIcon
                type="error"
                variant={'filled'}
              />
            )}
          </Flexbox>
        </Flexbox>
      </Modal>
    );
  },
);

CustomPluginInstallModal.displayName = 'CustomPluginInstallModal';

export default CustomPluginInstallModal;
