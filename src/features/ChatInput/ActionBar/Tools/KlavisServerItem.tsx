import { App, Checkbox } from 'antd';
import { Loader2 } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import { KlavisServer, KlavisServerStatus } from '@/store/tool/slices/klavisStore';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

interface KlavisServerItemProps {
  icon: string;
  label: string;
  server?: KlavisServer;
  type: string;
}

const KlavisServerItem = memo<KlavisServerItemProps>(({ icon, label, server, type }) => {
  const { t } = useTranslation('setting');
  const { message } = App.useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const oauthWindowRef = useRef<Window | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const userId = useUserStore(userProfileSelectors.userId);
  const createKlavisServer = useToolStore((s) => s.createKlavisServer);
  const removeKlavisServer = useToolStore((s) => s.removeKlavisServer);
  const refreshKlavisServerTools = useToolStore((s) => s.refreshKlavisServerTools);

  /**
   * 监听 OAuth 窗口关闭，然后刷新工具列表以检查认证状态
   */
  const startOAuthWindowMonitor = useCallback(
    (oauthWindow: Window, serverName: string) => {
      // 清理之前的轮询
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      // 每 500ms 检查窗口是否关闭
      pollIntervalRef.current = setInterval(() => {
        if (oauthWindow.closed) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          oauthWindowRef.current = null;

          // 窗口关闭后，调用 refreshKlavisServerTools 检查认证状态
          refreshKlavisServerTools(serverName);
        }
      }, 500);
    },
    [refreshKlavisServerTools],
  );

  /**
   * 打开 OAuth 窗口
   */
  const openOAuthWindow = useCallback(
    (oauthUrl: string, serverName: string) => {
      const oauthWindow = window.open(oauthUrl, '_blank', 'width=600,height=700');
      if (oauthWindow) {
        oauthWindowRef.current = oauthWindow;
        startOAuthWindowMonitor(oauthWindow, serverName);
        message.info(
          t('tools.klavis.oauthRequired', {
            defaultValue: 'Please complete OAuth authentication in the new window',
          }),
        );
      }
    },
    [startOAuthWindowMonitor, message, t],
  );

  // Get plugin ID for this server (使用 serverName)
  const pluginId = server ? `klavis:${server.serverName}` : '';
  const [checked, togglePlugin] = useAgentStore((s) => [
    agentSelectors.currentAgentPlugins(s).includes(pluginId),
    s.togglePlugin,
  ]);

  const handleConnect = async () => {
    if (!userId) {
      message.error(
        t('tools.klavis.loginRequired', {
          defaultValue: 'Please login to connect Klavis servers',
        }),
      );
      return;
    }

    // 如果服务器已经存在，提示用户
    if (server) {
      message.info(
        t('tools.klavis.alreadyConnected', {
          defaultValue: 'This server is already connected',
        }),
      );
      return;
    }

    setIsConnecting(true);
    try {
      const newServer = await createKlavisServer({
        serverName: type,
        userId,
      });


      if (newServer) {
        // 安装完成后自动启用插件
        const newPluginId = `klavis:${newServer.serverName}`;
        await togglePlugin(newPluginId);

        // 检查是否需要 OAuth
        if (newServer.oauthUrl) {
          // 打开 OAuth 窗口并监听关闭
          openOAuthWindow(newServer.oauthUrl, newServer.serverName);
        } else {
          // 不需要 OAuth，直接刷新工具列表
          await refreshKlavisServerTools(newServer.serverName);
          message.success(
            t('tools.klavis.serverConnected', { defaultValue: 'Server connected successfully' }),
          );
        }
      }
    } catch (error) {
      console.error('[Klavis] Failed to connect server:', error);
      message.error(
        t('tools.klavis.serverConnectionFailed', { defaultValue: 'Failed to connect server' }),
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!server) return;

    try {
      await removeKlavisServer(server.serverName);
      message.success(
        t('tools.klavis.serverDisconnected', { defaultValue: 'Server disconnected' }),
      );
    } catch (error) {
      console.error('[Klavis] Failed to disconnect server:', error);
      message.error(
        t('tools.klavis.serverDisconnectionFailed', {
          defaultValue: 'Failed to disconnect server',
        }),
      );
    }
  };

  const handleToggle = async () => {
    if (!server) return;
    await togglePlugin(pluginId);
  };

  const renderStatus = () => {
    if (isConnecting) {
      return (
        <Loader2
          size={14}
          style={{ animation: 'spin 1s linear infinite', color: '#1890ff' }}
        />
      );
    }

    if (!server) {
      return (
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleConnect();
          }}
          style={{ color: '#888', cursor: 'pointer', fontSize: 12 }}
        >
          {t('tools.klavis.connect', { defaultValue: 'Connect' })}
        </span>
      );
    }

    switch (server.status) {
      case KlavisServerStatus.CONNECTED: {
        return (
          <Flexbox align="center" gap={8} horizontal>
            <Checkbox
              checked={checked}
              onChange={handleToggle}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleDisconnect();
              }}
              style={{ color: '#888', cursor: 'pointer', fontSize: 12 }}
            >
              {t('tools.klavis.disconnect', { defaultValue: 'Disconnect' })}
            </span>
          </Flexbox>
        );
      }
      case KlavisServerStatus.PENDING_AUTH: {
        return (
          <span
            onClick={(e) => {
              e.stopPropagation();
              // 点击重新打开 OAuth 窗口
              if (server.oauthUrl) {
                openOAuthWindow(server.oauthUrl, server.serverName);
              }
            }}
            style={{ color: '#ff9800', cursor: 'pointer', fontSize: 12 }}
          >
            {t('tools.klavis.pendingAuth', { defaultValue: 'Pending Auth' })}
          </span>
        );
      }
      case KlavisServerStatus.ERROR: {
        return (
          <span style={{ color: '#f5222d', fontSize: 12 }}>
            {t('tools.klavis.error', { defaultValue: 'Error' })}
          </span>
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Flexbox
      align="center"
      gap={8}
      horizontal
      justify="space-between"
      style={{ padding: '4px 12px', width: '100%' }}
    >
      <Flexbox align="center" gap={8} horizontal>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 14 }}>{label}</span>
      </Flexbox>
      {renderStatus()}
    </Flexbox>
  );
});

export default KlavisServerItem;
