'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Avatar, Button, Icon } from '@lobehub/ui';
import { Checkbox } from 'antd';
import { CheckCircle, Loader2, Package, Search, SquareArrowOutUpRight, Unplug } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import { klavisStoreSelectors } from '@/store/tool/selectors';
import { KlavisServerStatus } from '@/store/tool/slices/klavisStore';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import type {
  OfficialToolItem,
  SearchOfficialToolsParams,
  SearchOfficialToolsState,
} from '../types';

// 轮询配置
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 15_000;

interface BuiltinToolItemProps {
  tool: OfficialToolItem;
}

/**
 * Builtin tool item - simple toggle
 */
const BuiltinToolItem = memo<BuiltinToolItemProps>(({ tool }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [checked, togglePlugin] = useAgentStore((s) => [
    agentSelectors.currentAgentPlugins(s).includes(tool.identifier),
    s.togglePlugin,
  ]);

  const handleToggle = async () => {
    setIsToggling(true);
    await togglePlugin(tool.identifier);
    setIsToggling(false);
  };

  return (
    <Flexbox
      gap={12}
      horizontal
      onClick={handleToggle}
      style={{
        background: 'var(--lobe-fill-tertiary)',
        borderRadius: 8,
        cursor: 'pointer',
        padding: 12,
      }}
    >
      <Avatar avatar={tool.icon || '🔧'} size={40} style={{ borderRadius: 8, flexShrink: 0 }} />
      <Flexbox flex={1} gap={4} style={{ overflow: 'hidden' }}>
        <Flexbox align="center" gap={8} horizontal>
          <span style={{ fontWeight: 600 }}>{tool.name}</span>
          <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>Built-in</span>
        </Flexbox>
        {tool.description && (
          <div
            style={{
              color: 'var(--lobe-text-secondary)',
              fontSize: 12,
              lineHeight: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {tool.description}
          </div>
        )}
      </Flexbox>
      <Flexbox align="center" justify="center" style={{ flexShrink: 0 }}>
        {isToggling ? (
          <Icon icon={Loader2} spin />
        ) : (
          <Checkbox checked={checked || tool.enabled} onClick={(e) => e.stopPropagation()} />
        )}
      </Flexbox>
    </Flexbox>
  );
});

interface KlavisToolItemProps {
  tool: OfficialToolItem;
}

/**
 * Klavis tool item - handles OAuth flow
 */
const KlavisToolItem = memo<KlavisToolItemProps>(({ tool }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isWaitingAuth, setIsWaitingAuth] = useState(false);

  const oauthWindowRef = useRef<Window | null>(null);
  const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userId = useUserStore(userProfileSelectors.userId);

  // Get Klavis server state
  const server = useToolStore((s) =>
    klavisStoreSelectors.getServers(s).find((srv) => srv.identifier === tool.identifier),
  );

  const createKlavisServer = useToolStore((s) => s.createKlavisServer);
  const refreshKlavisServerTools = useToolStore((s) => s.refreshKlavisServerTools);
  const removeKlavisServer = useToolStore((s) => s.removeKlavisServer);

  const [checked, togglePlugin] = useAgentStore((s) => [
    agentSelectors.currentAgentPlugins(s).includes(tool.identifier),
    s.togglePlugin,
  ]);

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

  // Stop polling when connected
  useEffect(() => {
    if (server?.status === KlavisServerStatus.CONNECTED && isWaitingAuth) {
      cleanup();
    }
  }, [server?.status, isWaitingAuth, cleanup]);

  const startFallbackPolling = useCallback(
    (serverIdentifier: string) => {
      if (pollIntervalRef.current) return;

      pollIntervalRef.current = setInterval(async () => {
        try {
          await refreshKlavisServerTools(serverIdentifier);
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

  const handleConnect = async () => {
    if (!userId || !tool.serverName) return;
    if (server) return;

    setIsConnecting(true);
    try {
      const newServer = await createKlavisServer({
        identifier: tool.identifier,
        serverName: tool.serverName,
        userId,
      });

      if (newServer) {
        await togglePlugin(newServer.identifier);

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
    await togglePlugin(tool.identifier);
    setIsToggling(false);
  };

  const handleDisconnect = async () => {
    if (!server) return;
    setIsToggling(true);
    if (checked) {
      await togglePlugin(tool.identifier);
    }
    await removeKlavisServer(server.identifier);
    setIsToggling(false);
  };

  // Render right control
  const renderRightControl = () => {
    if (isConnecting) {
      return <Icon icon={Loader2} spin />;
    }

    if (!server) {
      return (
        <Button
          icon={<SquareArrowOutUpRight size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleConnect();
          }}
          size="small"
          type="primary"
        >
          Connect
        </Button>
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
          <Button
            icon={<SquareArrowOutUpRight size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              if (server.oauthUrl) {
                openOAuthWindow(server.oauthUrl, server.identifier);
              }
            }}
            size="small"
          >
            Authorize
          </Button>
        );
      }
      case KlavisServerStatus.ERROR: {
        return <span style={{ color: 'red', fontSize: 12 }}>Error</span>;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Flexbox
      gap={12}
      horizontal
      onClick={() => {
        if (server?.status === KlavisServerStatus.CONNECTED) {
          handleToggle();
        }
      }}
      style={{
        background: 'var(--lobe-fill-tertiary)',
        borderRadius: 8,
        cursor: server?.status === KlavisServerStatus.CONNECTED ? 'pointer' : 'default',
        padding: 12,
      }}
    >
      {tool.icon ? (
        <Image
          alt={tool.name}
          height={40}
          src={tool.icon}
          style={{ borderRadius: 8, flexShrink: 0 }}
          unoptimized
          width={40}
        />
      ) : (
        <Avatar avatar="☁️" size={40} style={{ borderRadius: 8, flexShrink: 0 }} />
      )}
      <Flexbox flex={1} gap={4} style={{ overflow: 'hidden' }}>
        <Flexbox align="center" gap={8} horizontal>
          <span style={{ fontWeight: 600 }}>{tool.name}</span>
          <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>Klavis</span>
          {server?.status === KlavisServerStatus.CONNECTED && (
            <CheckCircle size={12} style={{ color: 'var(--lobe-success-6)' }} />
          )}
        </Flexbox>
        {tool.description && (
          <div
            style={{
              color: 'var(--lobe-text-secondary)',
              fontSize: 12,
              lineHeight: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {tool.description}
          </div>
        )}
      </Flexbox>
      <Flexbox align="center" justify="center" style={{ flexShrink: 0 }}>
        {renderRightControl()}
      </Flexbox>
    </Flexbox>
  );
});

const SearchOfficialTools = memo<
  BuiltinRenderProps<SearchOfficialToolsParams, SearchOfficialToolsState>
>(({ pluginState }) => {
  const { tools, totalCount, query, klavisEnabled } = pluginState || {
    klavisEnabled: false,
    tools: [],
    totalCount: 0,
  };

  if (!tools || tools.length === 0) {
    return (
      <Flexbox align="center" gap={8} style={{ color: 'var(--lobe-text-tertiary)', padding: 16 }}>
        <Search size={24} />
        <span>No official tools found{query ? ` for "${query}"` : ''}.</span>
      </Flexbox>
    );
  }

  const builtinTools = tools.filter((t) => t.type === 'builtin');
  const klavisTools = tools.filter((t) => t.type === 'klavis');
  const enabledCount = tools.filter((t) => t.enabled).length;

  return (
    <Flexbox gap={12}>
      <Flexbox align="center" gap={8} horizontal>
        <Package size={16} style={{ color: 'var(--lobe-primary-6)' }} />
        <span style={{ fontWeight: 500 }}>
          {query ? `Search results for "${query}"` : 'Official Tools'}
        </span>
        <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>
          ({totalCount} total, {enabledCount} enabled)
        </span>
      </Flexbox>

      {builtinTools.length > 0 && (
        <Flexbox gap={8}>
          <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12, fontWeight: 500 }}>
            Built-in Tools
          </span>
          {builtinTools.map((tool) => (
            <BuiltinToolItem key={tool.identifier} tool={tool} />
          ))}
        </Flexbox>
      )}

      {klavisEnabled && klavisTools.length > 0 && (
        <Flexbox gap={8}>
          <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12, fontWeight: 500 }}>
            Klavis Integrations
          </span>
          {klavisTools.map((tool) => (
            <KlavisToolItem key={tool.identifier} tool={tool} />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default SearchOfficialTools;
