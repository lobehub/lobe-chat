'use client';

import { Modal } from '@lobehub/ui';
import { App } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { McpConnectionParams } from '@/types/plugins';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import CustomPluginModal, { getCustomModalConfig } from './CustomPluginModal';
import MarketplacePluginModal, { getMarketplaceModalConfig } from './MarketplacePluginModal';
import OfficialPluginModal, { getOfficialModalConfig } from './OfficialPluginModal';
import { McpInstallRequest, PluginSource } from './types';

interface PluginInstallConfirmModalProps {
  installRequest: McpInstallRequest | null;
  onComplete?: () => void;
}

/**
 * 根据安装请求的来源确定插件类型
 */
const getPluginSource = (request: McpInstallRequest): PluginSource => {
  const { marketId } = request;

  // 官方 LobeHub 插件
  if (marketId === 'lobehub') {
    return PluginSource.OFFICIAL;
  }

  // 第三方市场插件（包括可信和不可信的）
  if (marketId && marketId !== 'lobehub') {
    return PluginSource.MARKETPLACE;
  }

  // 自定义插件（没有 marketId）
  return PluginSource.CUSTOM;
};

const PluginInstallConfirmModal = memo<PluginInstallConfirmModalProps>(
  ({ installRequest, onComplete }) => {
    const { message } = App.useApp();
    const { t } = useTranslation('plugin');
    const [loading, setLoading] = useState(false);

    // 跟踪配置更新
    const [updatedConfig, setUpdatedConfig] = useState<{
      env?: Record<string, string>;
      headers?: Record<string, string>;
    }>({});

    const [installCustomPlugin] = useToolStore((s) => [s.installCustomPlugin]);
    const testMcpConnection = useToolStore((s) => s.testMcpConnection);
    const togglePlugin = useAgentStore((s) => s.togglePlugin);

    // 为自定义插件测试连接生成唯一标识符
    const identifier = installRequest?.schema?.identifier || '';
    const testState = useToolStore(mcpStoreSelectors.getMCPConnectionTestState(identifier));

    // 重置加载状态和配置
    useEffect(() => {
      if (!installRequest) {
        setLoading(false);
        setUpdatedConfig({});
      }
    }, [installRequest]);

    const handleConfirm = useCallback(async () => {
      if (!installRequest) return;

      setLoading(true);
      try {
        const pluginSource = getPluginSource(installRequest);

        if (pluginSource === PluginSource.OFFICIAL) {
          // 官方插件：获取 manifest 然后安装
          // const manifest = await pluginHelpers.getPluginManifest(installRequest.pluginId);
          // await installCustomPlugin(manifest);
          // message.success(t('protocolInstall.messages.installSuccess', {
          //   name: manifest.manifest.meta.title
          // }));
        } else {
          // 第三方市场和自定义插件：构建自定义插件数据
          const { schema } = installRequest;
          if (!schema) {
            throw new Error('Schema is required for non-official plugins');
          }

          let customPlugin: LobeToolCustomPlugin;

          // 合并原始配置和用户更新的配置
          const finalConfig = {
            ...schema.config,
            env: updatedConfig.env || schema.config.env,
            headers: updatedConfig.headers || schema.config.headers,
          };

          // 自定义插件：先测试连接获取真实的 manifest
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

          // 使用测试连接获取的真实 manifest
          customPlugin = {
            customParams: {
              avatar: schema.icon,
              description: schema.description,
              mcp: {
                ...finalConfig, // 使用合并后的配置
                headers: finalConfig.type === 'http' ? finalConfig.headers : undefined,
              },
            },
            identifier: schema.identifier,
            manifest: testResult.manifest, // 使用真实的 manifest
            type: 'customPlugin',
          };

          await installCustomPlugin(customPlugin);
          await togglePlugin(schema.identifier);
          message.success(t('protocolInstall.messages.installSuccess', { name: schema.name }));
        }

        onComplete?.();
      } catch (error) {
        console.error('Plugin installation error:', error);
        message.error(t('protocolInstall.messages.installError'));
        setLoading(false);
      }
    }, [installRequest, onComplete, updatedConfig]);

    const handleCancel = useCallback(() => {
      onComplete?.();
    }, [onComplete]);

    if (!installRequest) return null;

    const pluginSource = getPluginSource(installRequest);

    // 获取对应插件类型的Modal配置
    const getModalConfig = () => {
      switch (pluginSource) {
        case PluginSource.OFFICIAL: {
          return getOfficialModalConfig(t);
        }

        case PluginSource.MARKETPLACE: {
          return getMarketplaceModalConfig(t);
        }

        default: {
          return getCustomModalConfig(t);
        }
      }
    };

    const modalConfig = getModalConfig();

    // 渲染对应的内容组件
    const renderContent = () => {
      const contentProps = {
        installRequest,
      };

      switch (pluginSource) {
        case PluginSource.OFFICIAL: {
          return <OfficialPluginModal {...contentProps} />;
        }
        case PluginSource.MARKETPLACE: {
          return (
            <MarketplacePluginModal
              marketId={installRequest.marketId}
              onConfigUpdate={setUpdatedConfig}
              schema={installRequest.schema}
              testError={testState.error}
            />
          );
        }

        default: {
          return (
            <CustomPluginModal
              onConfigUpdate={setUpdatedConfig}
              schema={installRequest.schema}
              testError={testState.error}
            />
          );
        }
      }
    };

    return (
      <Modal
        confirmLoading={loading || testState.loading}
        okText={modalConfig.okText}
        onCancel={handleCancel}
        onOk={handleConfirm}
        open
        title={modalConfig.title}
        width={600}
      >
        {renderContent()}
      </Modal>
    );
  },
);

PluginInstallConfirmModal.displayName = 'PluginInstallConfirmModal';

export default PluginInstallConfirmModal;
