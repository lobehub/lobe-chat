'use client';

import { Block, Modal, Text } from '@lobehub/ui';
import { App } from 'antd';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DetailProvider } from '@/features/MCPPluginDetail/DetailProvider';
import Header from '@/features/MCPPluginDetail/Header';
import Overview from '@/features/MCPPluginDetail/Overview';
import DetailLoading from '@/features/PluginStore/McpList/Detail/Loading';
import { useAgentStore } from '@/store/agent';
import { useDiscoverStore } from '@/store/discover';
import { useToolStore } from '@/store/tool';

import { McpInstallRequest } from './types';

interface OfficialPluginInstallModalProps {
  installRequest: McpInstallRequest | null;
  onComplete?: () => void;
}

const OfficialPluginInstallModal = memo<OfficialPluginInstallModalProps>(
  ({ installRequest, onComplete }) => {
    const { message } = App.useApp();
    const { t } = useTranslation(['plugin', 'common']);
    const [loading, setLoading] = useState(false);

    const [installCustomPlugin] = useToolStore((s) => [s.installCustomPlugin]);
    const togglePlugin = useAgentStore((s) => s.togglePlugin);

    // 获取 MCP 插件详情
    const useMcpDetail = useDiscoverStore((s) => s.useFetchMcpDetail);
    const { data, isLoading } = useMcpDetail({
      identifier: installRequest?.pluginId || '',
    });

    const handleConfirm = useCallback(async () => {
      if (!installRequest || !data) return;

      setLoading(true);
      try {
        // 官方插件：使用获取到的详情数据安装
        // TODO: 实现官方插件的安装逻辑
        // const manifest = await pluginHelpers.getPluginManifest(installRequest.pluginId);
        // await installCustomPlugin(manifest);
        // await togglePlugin(installRequest.pluginId);

        console.log('Installing official plugin:', installRequest.pluginId, data);
        message.success(t('protocolInstall.messages.installSuccess', { name: data.name }));

        onComplete?.();
      } catch (error) {
        console.error('Official plugin installation error:', error);
        message.error(t('protocolInstall.messages.installError'));
        setLoading(false);
      }
    }, [installRequest, data, onComplete, installCustomPlugin, togglePlugin, message, t]);

    const handleCancel = useCallback(() => {
      onComplete?.();
    }, [onComplete]);

    if (!installRequest) return null;

    // 渲染内容
    const renderContent = () => {
      // 如果正在加载，显示骨架屏
      if (isLoading) {
        return <DetailLoading />;
      }

      // 如果加载失败或没有数据，显示错误信息
      if (!data) {
        return (
          <Block>
            <Text type="danger">{t('protocolInstall.messages.manifestError')}</Text>
          </Block>
        );
      }

      return (
        <DetailProvider config={data}>
          <Flexbox gap={16}>
            <Header inModal />
            <Overview inModal />
          </Flexbox>
        </DetailProvider>
      );
    };

    return (
      <Modal
        confirmLoading={loading}
        okText={t('protocolInstall.actions.install')}
        onCancel={handleCancel}
        onOk={handleConfirm}
        open
        title={t('protocolInstall.official.title')}
        width={800}
      >
        {renderContent()}
      </Modal>
    );
  },
);

OfficialPluginInstallModal.displayName = 'OfficialPluginInstallModal';

export default OfficialPluginInstallModal;
