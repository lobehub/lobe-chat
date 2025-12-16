'use client';

import { KLAVIS_SERVER_TYPES, KlavisServerType } from '@lobechat/const';
import { Icon, Image } from '@lobehub/ui';
import { Checkbox } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Loader2, SquareArrowOutUpRight, Unplug } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import {
  KlavisServer,
  KlavisServerStatus,
  klavisStoreSelectors,
} from '@/store/tool/slices/klavisStore';
import { useUserStore } from '@/store/user';
import { settingsSelectors, userProfileSelectors } from '@/store/user/selectors';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 15_000;

interface KlavisServerItemInlineProps {
  icon: KlavisServerType['icon'];
  identifier: string;
  label: string;
  server?: KlavisServer;
  serverName: string;
}

const KlavisServerItemInline = memo<KlavisServerItemInlineProps>(
  ({ identifier, label, server, serverName, icon }) => {
    const { t } = useTranslation('setting');
    const theme = useTheme();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isWaitingAuth, setIsWaitingAuth] = useState(false);

    const oauthWindowRef = useRef<Window | null>(null);
    const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const userId = useUserStore(userProfileSelectors.userId);
    const createKlavisServer = useToolStore((s) => s.createKlavisServer);
    const refreshKlavisServerTools = useToolStore((s) => s.refreshKlavisServerTools);
    const removeKlavisServer = useToolStore((s) => s.removeKlavisServer);

    const cleanup = useCallback(() => {
      if (windowCheckIntervalRef.current) {
        clearInterval(windowCheckIntervalRef.current);
        windowCheckIntervalRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      oauthWindowRef.current = null;
      setIsWaitingAuth(false);
    }, []);

    useEffect(() => {
      return () => {
        cleanup();
      };
    }, [cleanup]);

    useEffect(() => {
      if (server?.status === KlavisServerStatus.CONNECTED && isWaitingAuth) {
        cleanup();
      }
    }, [server?.status, isWaitingAuth, cleanup]);

    const startFallbackPolling = useCallback(
      (serverName: string) => {
        if (pollIntervalRef.current) return;

        pollIntervalRef.current = setInterval(async () => {
          try {
            await refreshKlavisServerTools(serverName);
          } catch (error) {
            console.error('[Klavis] Failed to check auth status:', error);
          }
        }, POLL_INTERVAL_MS);

        pollTimeoutRef.current = setTimeout(() => {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsWaitingAuth(false);
        }, POLL_TIMEOUT_MS);
      },
      [refreshKlavisServerTools],
    );

    const startWindowMonitor = useCallback(
      (oauthWindow: Window, serverName: string) => {
        windowCheckIntervalRef.current = setInterval(() => {
          try {
            if (oauthWindow.closed) {
              if (windowCheckIntervalRef.current) {
                clearInterval(windowCheckIntervalRef.current);
                windowCheckIntervalRef.current = null;
              }
              oauthWindowRef.current = null;
              refreshKlavisServerTools(serverName);
            }
          } catch {
            if (windowCheckIntervalRef.current) {
              clearInterval(windowCheckIntervalRef.current);
              windowCheckIntervalRef.current = null;
            }
            startFallbackPolling(serverName);
          }
        }, 500);
      },
      [refreshKlavisServerTools, startFallbackPolling],
    );

    const openOAuthWindow = useCallback(
      (oauthUrl: string, serverName: string) => {
        cleanup();
        setIsWaitingAuth(true);

        const oauthWindow = window.open(oauthUrl, '_blank', 'width=600,height=700');
        if (oauthWindow) {
          oauthWindowRef.current = oauthWindow;
          startWindowMonitor(oauthWindow, serverName);
        } else {
          startFallbackPolling(serverName);
        }
      },
      [cleanup, startWindowMonitor, startFallbackPolling],
    );

    const pluginId = server ? server.identifier : '';
    const [checked, toggleDefaultPlugin] = useUserStore((s) => [
      (settingsSelectors.currentSettings(s).defaultAgent?.config?.plugins || []).includes(pluginId),
      s.toggleDefaultPlugin,
    ]);

    const handleConnect = async () => {
      if (!userId || server) return;

      setIsConnecting(true);
      try {
        const newServer = await createKlavisServer({
          identifier,
          serverName,
          userId,
        });

        if (newServer) {
          const newPluginId = newServer.identifier;
          await toggleDefaultPlugin(newPluginId);

          if (newServer.isAuthenticated) {
            await refreshKlavisServerTools(newServer.identifier);
          } else if (newServer.oauthUrl) {
            openOAuthWindow(newServer.oauthUrl, newServer.identifier);
          }
        }
      } catch (error) {
        console.error('[Klavis] Failed to connect server:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    const handleToggle = async () => {
      if (!server) return;
      setIsToggling(true);
      await toggleDefaultPlugin(pluginId);
      setIsToggling(false);
    };

    const handleDisconnect = async () => {
      if (!server) return;
      setIsToggling(true);
      if (checked) {
        await toggleDefaultPlugin(pluginId);
      }
      await removeKlavisServer(server.identifier);
      setIsToggling(false);
    };

    const renderIcon = () => {
      if (typeof icon === 'string') {
        return <Image alt={label} height={20} src={icon} style={{ flex: 'none' }} width={20} />;
      }
      return <Icon fill={theme.colorText} icon={icon} size={20} />;
    };

    const renderRightControl = () => {
      if (isConnecting) {
        return <Icon icon={Loader2} spin />;
      }

      if (!server) {
        return (
          <Flexbox
            align="center"
            gap={4}
            horizontal
            onClick={(e) => {
              e.stopPropagation();
              handleConnect();
            }}
            style={{ cursor: 'pointer', opacity: 0.65 }}
          >
            {t('tools.klavis.connect', { defaultValue: 'Connect' })}
            <Icon icon={SquareArrowOutUpRight} size="small" />
          </Flexbox>
        );
      }

      switch (server.status) {
        case KlavisServerStatus.CONNECTED: {
          if (isToggling) {
            return <Icon icon={Loader2} spin />;
          }
          return (
            <Flexbox align="center" gap={8} horizontal>
              <Icon
                icon={Unplug}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDisconnect();
                }}
                size="small"
                style={{ cursor: 'pointer', opacity: 0.5 }}
              />
              <Checkbox
                checked={checked}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle();
                }}
              />
            </Flexbox>
          );
        }
        case KlavisServerStatus.PENDING_AUTH: {
          if (isWaitingAuth) {
            return <Icon icon={Loader2} spin />;
          }
          return (
            <Flexbox
              align="center"
              gap={4}
              horizontal
              onClick={(e) => {
                e.stopPropagation();
                if (server.oauthUrl) {
                  openOAuthWindow(server.oauthUrl, server.identifier);
                }
              }}
              style={{ cursor: 'pointer', opacity: 0.65 }}
            >
              {t('tools.klavis.pendingAuth', { defaultValue: 'Authorize' })}
              <Icon icon={SquareArrowOutUpRight} size="small" />
            </Flexbox>
          );
        }
        case KlavisServerStatus.ERROR: {
          return (
            <span style={{ color: 'red', fontSize: 12 }}>
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
        gap={12}
        horizontal
        justify="space-between"
        onClick={() => {
          if (server?.status === KlavisServerStatus.CONNECTED) {
            handleToggle();
          }
        }}
        style={{
          background: theme.colorFillQuaternary,
          borderRadius: theme.borderRadius,
          cursor: server?.status === KlavisServerStatus.CONNECTED ? 'pointer' : 'default',
          padding: '12px 16px',
        }}
      >
        <Flexbox align="center" gap={12} horizontal>
          {renderIcon()}
          <span>{label}</span>
        </Flexbox>
        {renderRightControl()}
      </Flexbox>
    );
  },
);

KlavisServerItemInline.displayName = 'KlavisServerItemInline';

const KlavisServerList = memo(() => {
  const allKlavisServers = useToolStore(klavisStoreSelectors.getServers, isEqual);
  const useFetchUserKlavisServers = useToolStore((s) => s.useFetchUserKlavisServers);

  useFetchUserKlavisServers(true);

  const getServerByIdentifier = (identifier: string) => {
    return allKlavisServers.find((server) => server.identifier === identifier);
  };

  return (
    <Flexbox gap={8} style={{ maxHeight: 240, overflowY: 'auto' }}>
      {KLAVIS_SERVER_TYPES.map((type) => (
        <KlavisServerItemInline
          icon={type.icon}
          identifier={type.identifier}
          key={type.identifier}
          label={type.label}
          server={getServerByIdentifier(type.identifier)}
          serverName={type.serverName}
        />
      ))}
    </Flexbox>
  );
});

KlavisServerList.displayName = 'KlavisServerList';

export default KlavisServerList;
