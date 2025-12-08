'use client';

import { KLAVIS_SERVER_TYPES } from '@lobechat/const';
import { BuiltinInterventionProps } from '@lobechat/types';
import { Avatar, Button, Icon } from '@lobehub/ui';
import { CheckCircle, Download, Loader2, Package, SquareArrowOutUpRight } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import { klavisStoreSelectors, mcpStoreSelectors, pluginSelectors } from '@/store/tool/selectors';
import { KlavisServerStatus } from '@/store/tool/slices/klavisStore/types';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import type { InstallPluginParams } from '../types';

// Polling configuration for Klavis OAuth
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 15_000;

const InstallPluginIntervention = memo<BuiltinInterventionProps<InstallPluginParams>>(
  ({ args }) => {
    const { identifier, source } = args;

    const [isInstalling, setIsInstalling] = useState(false);
    const [isWaitingAuth, setIsWaitingAuth] = useState(false);
    const [installSuccess, setInstallSuccess] = useState(false);
    const [installError, setInstallError] = useState<string | null>(null);

    const { isAuthenticated, signIn } = useMarketAuth();
    const userId = useUserStore(userProfileSelectors.userId);

    // Refs for Klavis OAuth polling
    const oauthWindowRef = useRef<Window | null>(null);
    const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Tool store selectors
    const [
      isPluginInstalled,
      isMCPInstalling,
      installMCPPlugin,
      cancelInstallMCPPlugin,
      createKlavisServer,
      refreshKlavisServerTools,
    ] = useToolStore((s) => [
      pluginSelectors.isPluginInstalled(identifier)(s),
      mcpStoreSelectors.isMCPInstalling(identifier)(s),
      s.installMCPPlugin,
      s.cancelInstallMCPPlugin,
      s.createKlavisServer,
      s.refreshKlavisServerTools,
    ]);

    // Get Klavis server state
    const klavisServer = useToolStore((s) =>
      klavisStoreSelectors.getServers(s).find((srv) => srv.identifier === identifier),
    );

    // Agent store
    const [agentId, currentPlugins, togglePlugin] = useAgentStore((s) => [
      s.activeAgentId,
      agentSelectors.currentAgentPlugins(s),
      s.togglePlugin,
    ]);

    // Check if it's a Klavis tool
    const klavisTypeInfo = KLAVIS_SERVER_TYPES.find((t) => t.identifier === identifier);
    const isKlavis = source === 'official' && !!klavisTypeInfo;

    // Cleanup timers
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
      return () => cleanup();
    }, [cleanup]);

    // Stop polling when Klavis connected
    useEffect(() => {
      if (klavisServer?.status === KlavisServerStatus.CONNECTED && isWaitingAuth) {
        cleanup();
        // Auto-enable the plugin after successful connection
        if (agentId && !currentPlugins.includes(identifier)) {
          togglePlugin(identifier).then(() => {
            setInstallSuccess(true);
          });
        } else {
          setInstallSuccess(true);
        }
      }
    }, [
      klavisServer?.status,
      isWaitingAuth,
      cleanup,
      agentId,
      currentPlugins,
      identifier,
      togglePlugin,
    ]);

    const startFallbackPolling = useCallback(
      (serverIdentifier: string) => {
        if (pollIntervalRef.current) return;

        pollIntervalRef.current = setInterval(async () => {
          try {
            await refreshKlavisServerTools(serverIdentifier);
          } catch (error) {
            console.error('[InstallPlugin] Failed to check auth status:', error);
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
      (oauthWindow: Window, serverIdentifier: string) => {
        windowCheckIntervalRef.current = setInterval(() => {
          try {
            if (oauthWindow.closed) {
              if (windowCheckIntervalRef.current) {
                clearInterval(windowCheckIntervalRef.current);
                windowCheckIntervalRef.current = null;
              }
              oauthWindowRef.current = null;
              refreshKlavisServerTools(serverIdentifier);
            }
          } catch {
            if (windowCheckIntervalRef.current) {
              clearInterval(windowCheckIntervalRef.current);
              windowCheckIntervalRef.current = null;
            }
            startFallbackPolling(serverIdentifier);
          }
        }, 500);
      },
      [refreshKlavisServerTools, startFallbackPolling],
    );

    const openOAuthWindow = useCallback(
      (oauthUrl: string, serverIdentifier: string) => {
        cleanup();
        setIsWaitingAuth(true);

        const oauthWindow = window.open(oauthUrl, '_blank', 'width=600,height=700');
        if (oauthWindow) {
          oauthWindowRef.current = oauthWindow;
          startWindowMonitor(oauthWindow, serverIdentifier);
        } else {
          startFallbackPolling(serverIdentifier);
        }
      },
      [cleanup, startWindowMonitor, startFallbackPolling],
    );

    // Handle MCP marketplace plugin installation
    const handleMCPInstall = async () => {
      // Check if cloud MCP needs authentication
      const toolState = useToolStore.getState();
      const mcpPlugin = mcpStoreSelectors.getPluginById(identifier)(toolState);
      const isCloudMcp = !!(
        (mcpPlugin as any)?.cloudEndPoint || (mcpPlugin as any)?.haveCloudEndpoint
      );

      if (isCloudMcp && !isAuthenticated) {
        try {
          await signIn();
        } catch {
          setInstallError('Authentication required for cloud MCP plugins');
          return;
        }
      }

      setIsInstalling(true);
      setInstallError(null);

      try {
        const isSuccess = await installMCPPlugin(identifier);
        if (isSuccess) {
          if (agentId) {
            await togglePlugin(identifier);
          }
          setInstallSuccess(true);
        }
      } catch (error) {
        setInstallError(error instanceof Error ? error.message : 'Installation failed');
      } finally {
        setIsInstalling(false);
      }
    };

    // Handle Klavis tool connection
    const handleKlavisConnect = async () => {
      if (!userId || !klavisTypeInfo?.serverName) return;

      setIsInstalling(true);
      setInstallError(null);

      try {
        const newServer = await createKlavisServer({
          identifier,
          serverName: klavisTypeInfo.serverName,
          userId,
        });

        if (newServer) {
          if (agentId) {
            await togglePlugin(newServer.identifier);
          }

          if (newServer.isAuthenticated) {
            await refreshKlavisServerTools(newServer.identifier);
            setInstallSuccess(true);
          } else if (newServer.oauthUrl) {
            openOAuthWindow(newServer.oauthUrl, newServer.identifier);
          }
        }
      } catch (error) {
        setInstallError(error instanceof Error ? error.message : 'Connection failed');
      } finally {
        setIsInstalling(false);
      }
    };

    // Handle OAuth authorization for existing Klavis server
    const handleKlavisAuth = () => {
      if (klavisServer?.oauthUrl) {
        openOAuthWindow(klavisServer.oauthUrl, klavisServer.identifier);
      }
    };

    const handleCancel = async () => {
      if (source === 'market') {
        await cancelInstallMCPPlugin(identifier);
      }
    };

    // Render success state
    if (installSuccess || isPluginInstalled) {
      return (
        <Flexbox
          align="center"
          gap={12}
          horizontal
          style={{
            background: 'var(--lobe-fill-tertiary)',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <CheckCircle size={20} style={{ color: 'var(--lobe-success-6)' }} />
          <Flexbox gap={4}>
            <span style={{ fontWeight: 600 }}>
              {isKlavis ? 'Connected and enabled' : 'Installed and enabled'}
            </span>
            <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12 }}>
              {klavisTypeInfo?.label || identifier}
            </span>
          </Flexbox>
        </Flexbox>
      );
    }

    // Render error state
    if (installError) {
      return (
        <Flexbox
          gap={12}
          style={{ background: 'var(--lobe-fill-tertiary)', borderRadius: 8, padding: 16 }}
        >
          <Flexbox align="center" gap={12} horizontal>
            <Package size={20} style={{ color: 'var(--lobe-error-6)' }} />
            <Flexbox gap={4}>
              <span style={{ fontWeight: 600 }}>Installation failed</span>
              <span style={{ color: 'var(--lobe-error-6)', fontSize: 12 }}>{installError}</span>
            </Flexbox>
          </Flexbox>
          <Button onClick={isKlavis ? handleKlavisConnect : handleMCPInstall} size="small">
            Retry
          </Button>
        </Flexbox>
      );
    }

    // Render Klavis tool
    if (isKlavis) {
      const icon = typeof klavisTypeInfo?.icon === 'string' ? klavisTypeInfo.icon : undefined;

      return (
        <Flexbox
          gap={12}
          style={{ background: 'var(--lobe-fill-tertiary)', borderRadius: 8, padding: 16 }}
        >
          <Flexbox align="center" gap={12} horizontal>
            {icon ? (
              <Image
                alt={klavisTypeInfo?.label || identifier}
                height={40}
                src={icon}
                style={{ borderRadius: 8 }}
                unoptimized
                width={40}
              />
            ) : (
              <Avatar avatar="☁️" size={40} style={{ borderRadius: 8 }} />
            )}
            <Flexbox flex={1} gap={4}>
              <Flexbox align="center" gap={8} horizontal>
                <span style={{ fontWeight: 600 }}>{klavisTypeInfo?.label || identifier}</span>
                <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>Klavis</span>
              </Flexbox>
              <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12 }}>
                Connect to enable this integration
              </span>
            </Flexbox>
          </Flexbox>

          <Flexbox gap={8} horizontal>
            {klavisServer?.status === KlavisServerStatus.PENDING_AUTH ? (
              <Button
                disabled={isWaitingAuth}
                icon={
                  isWaitingAuth ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <SquareArrowOutUpRight size={14} />
                  )
                }
                onClick={handleKlavisAuth}
                type="primary"
              >
                {isWaitingAuth ? 'Waiting for authorization...' : 'Authorize'}
              </Button>
            ) : (
              <Button
                disabled={isInstalling || isWaitingAuth}
                icon={
                  isInstalling || isWaitingAuth ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <SquareArrowOutUpRight size={14} />
                  )
                }
                onClick={handleKlavisConnect}
                type="primary"
              >
                {isInstalling
                  ? 'Connecting...'
                  : isWaitingAuth
                    ? 'Waiting...'
                    : 'Connect & Authorize'}
              </Button>
            )}
          </Flexbox>
        </Flexbox>
      );
    }

    // Render MCP marketplace plugin
    return (
      <Flexbox
        gap={12}
        style={{ background: 'var(--lobe-fill-tertiary)', borderRadius: 8, padding: 16 }}
      >
        <Flexbox align="center" gap={12} horizontal>
          <Avatar avatar="🔧" size={40} style={{ borderRadius: 8 }} />
          <Flexbox flex={1} gap={4}>
            <Flexbox align="center" gap={8} horizontal>
              <span style={{ fontWeight: 600 }}>{identifier}</span>
              <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>MCP Plugin</span>
            </Flexbox>
            <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12 }}>
              Install this plugin to enable it for the agent
            </span>
          </Flexbox>
        </Flexbox>

        <Flexbox gap={8} horizontal>
          {isInstalling || isMCPInstalling ? (
            <Button icon={<Icon icon={Loader2} spin />} onClick={handleCancel} variant="filled">
              Cancel
            </Button>
          ) : (
            <Button icon={<Download size={14} />} onClick={handleMCPInstall} type="primary">
              Install Plugin
            </Button>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default InstallPluginIntervention;
