'use client';

import { KLAVIS_SERVER_TYPES } from '@lobechat/const';
import { BuiltinInterventionProps } from '@lobechat/types';
import { Avatar, Button, Icon } from '@lobehub/ui';
import { CheckCircle, Download, Loader2, Package } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import { klavisStoreSelectors, mcpStoreSelectors, pluginSelectors } from '@/store/tool/selectors';
import { KlavisServerStatus } from '@/store/tool/slices/klavisStore/types';

import type { InstallPluginParams } from '../types';

const InstallPluginIntervention = memo<BuiltinInterventionProps<InstallPluginParams>>(
  ({ args }) => {
    const { identifier, source } = args;
    const { t } = useTranslation('chat');

    const [isInstalling, setIsInstalling] = useState(false);
    const [isWaitingAuth, setIsWaitingAuth] = useState(false);
    const [installSuccess, setInstallSuccess] = useState(false);
    const [installError, setInstallError] = useState<string | null>(null);

    const { isAuthenticated, signIn } = useMarketAuth();

    // Refs for Klavis OAuth polling
    const oauthWindowRef = useRef<Window | null>(null);
    const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Tool store selectors
    const [isPluginInstalled, isMCPInstalling, installMCPPlugin, cancelInstallMCPPlugin] =
      useToolStore((s) => [
        pluginSelectors.isPluginInstalled(identifier)(s),
        mcpStoreSelectors.isMCPInstalling(identifier)(s),
        s.installMCPPlugin,
        s.cancelInstallMCPPlugin,
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
          setInstallError(t('agentBuilder.installPlugin.authRequired'));
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
        setInstallError(
          error instanceof Error ? error.message : t('agentBuilder.installPlugin.installFailed'),
        );
      } finally {
        setIsInstalling(false);
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
              {isKlavis
                ? t('agentBuilder.installPlugin.connectedAndEnabled')
                : t('agentBuilder.installPlugin.installedAndEnabled')}
            </span>
            <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12 }}>
              {klavisTypeInfo?.label || identifier}
            </span>
          </Flexbox>
        </Flexbox>
      );
    }

    // Render Klavis tool
    if (isKlavis) {
      const icon = typeof klavisTypeInfo?.icon === 'string' ? klavisTypeInfo.icon : undefined;
      const isPendingAuth = klavisServer?.status === KlavisServerStatus.PENDING_AUTH;

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
                {isPendingAuth
                  ? t('agentBuilder.installPlugin.requiresAuth')
                  : t('agentBuilder.installPlugin.clickApproveToConnect')}
              </span>
            </Flexbox>
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
          {installError ? (
            <Package size={40} style={{ color: 'var(--lobe-error-6)' }} />
          ) : (
            <Avatar avatar="🔧" size={40} style={{ borderRadius: 8 }} />
          )}
          <Flexbox flex={1} gap={4}>
            <Flexbox align="center" gap={8} horizontal>
              <span style={{ fontWeight: 600 }}>{identifier}</span>
              <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>MCP Plugin</span>
            </Flexbox>
            <span
              style={{
                color: installError ? 'var(--lobe-error-6)' : 'var(--lobe-text-secondary)',
                fontSize: 12,
              }}
            >
              {installError || t('agentBuilder.installPlugin.installToEnable')}
            </span>
          </Flexbox>
        </Flexbox>

        <Flexbox gap={8} horizontal>
          {isInstalling || isMCPInstalling ? (
            <Button icon={<Icon icon={Loader2} spin />} onClick={handleCancel} variant="filled">
              {t('agentBuilder.installPlugin.cancel')}
            </Button>
          ) : (
            <Button icon={<Download size={14} />} onClick={handleMCPInstall} type="primary">
              {installError
                ? t('agentBuilder.installPlugin.retry')
                : t('agentBuilder.installPlugin.installPlugin')}
            </Button>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default InstallPluginIntervention;
