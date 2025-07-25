'use client';

import { Modal } from '@lobehub/ui';
import { App } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { useToolStore } from '@/store/tool';
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
  const { marketId, source } = request;

  // 官方 LobeHub 插件
  if (source === 'official' || marketId === 'lobehub') {
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

    const [installCustomPlugin] = useToolStore((s) => [s.installCustomPlugin]);
    const togglePlugin = useAgentStore((s) => s.togglePlugin);

    // 重置加载状态
    useEffect(() => {
      if (!installRequest) {
        setLoading(false);
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

          const customPlugin: LobeToolCustomPlugin = {
            customParams: {
              avatar: '',
              description: schema.description,
              mcp: {
                ...schema.config,
                auth: undefined,
                headers: schema.config.type === 'http' ? schema.config.headers : undefined,
              },
            },
            identifier: schema.identifier,
            manifest: {
              api: [],
              identifier: schema.identifier,
              meta: {
                avatar: '',
                description: schema.description,
                tags: [],
                title: schema.name,
              },
              type: 'default',
              version: '1',
            },
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
    }, [installRequest, installCustomPlugin, togglePlugin, message, t, onComplete]);

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
        case PluginSource.CUSTOM: {
          return getCustomModalConfig(t);
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
          return <MarketplacePluginModal {...contentProps} />;
        }
        case PluginSource.CUSTOM: {
          return <CustomPluginModal {...contentProps} />;
        }
        default: {
          return <CustomPluginModal {...contentProps} />;
        }
      }
    };

    return (
      <Modal
        confirmLoading={loading}
        okText={modalConfig.okText}
        onCancel={handleCancel}
        onOk={handleConfirm}
        open
        title={modalConfig.title}
        width={modalConfig.width}
      >
        {renderContent()}
      </Modal>
    );
  },
);

PluginInstallConfirmModal.displayName = 'PluginInstallConfirmModal';

export default PluginInstallConfirmModal;
