'use client';

import { safeParseJSON } from '@lobechat/utils';
import { createStaticStyles, cssVar, cx, Skeleton } from '@lobehub/ui';
import { type AppBridge, buildAllowAttribute } from '@modelcontextprotocol/ext-apps/app-bridge';
import { useLatest } from 'ahooks';
import { memo, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { useConversationStore } from '@/features/Conversation/store';
import { useIsDark } from '@/hooks/useIsDark';
import { useClientDataSWR } from '@/libs/swr';
import { mcpAppKeys } from '@/libs/swr/keys';
import { mcpService } from '@/services/mcp';

import { buildHostContext, connectMcpAppBridge } from './bridge';
import { buildAppCsp, injectCsp, pickAppResource, toCallToolResult } from './utils';

const DEFAULT_HEIGHT = 320;
const MAX_HEIGHT = 2000;

const styles = createStaticStyles(({ css }) => ({
  bordered: css`
    overflow: hidden;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};
    background: ${cssVar.colorBgContainer};
  `,
  iframe: css`
    display: block;
    width: 100%;
    border: none;
    background: transparent;
  `,
}));

export interface McpAppViewProps {
  apiName: string;
  /** Raw JSON arguments of the tool call. */
  arguments?: string;
  /** Rendered instead when the view can't be loaded. */
  fallback: ReactNode;
  identifier: string;
  resourceUri: string;
  /** Tool call result envelope (`{ content, state, success }`). */
  result: { content: string; state?: any };
  toolCallId: string;
}

/**
 * Renders an MCP Apps (SEP-1865) view: the `ui://` HTML a tool declares, in a
 * sandboxed iframe that talks to LobeHub over the MCP Apps postMessage protocol.
 */
const McpAppView = memo<McpAppViewProps>(
  ({ apiName, arguments: args, fallback, identifier, resourceUri, result, toolCallId }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState(DEFAULT_HEIGHT);
    const isDark = useIsDark();
    const sendMessage = useConversationStore((s) => s.sendMessage);

    const { data, error, isLoading } = useClientDataSWR(
      mcpAppKeys.resource(identifier, resourceUri),
      () => mcpService.readMcpAppResource(identifier, resourceUri),
      { revalidateOnFocus: false, revalidateOnReconnect: false },
    );

    const resource = useMemo(() => pickAppResource(data, resourceUri), [data, resourceUri]);
    const srcDoc = useMemo(
      () => resource && injectCsp(resource.html, buildAppCsp(resource.meta?.csp)),
      [resource],
    );

    // Everything the bridge reads after mount goes through a ref, so the
    // iframe session is created once per document instead of per render.
    const latest = useLatest({ args, identifier, isDark, result, sendMessage });
    const bridgeRef = useRef<AppBridge>(undefined);

    useEffect(() => {
      const target = iframeRef.current?.contentWindow;
      if (!srcDoc || !target) return;

      const { bridge, dispose } = connectMcpAppBridge(target, {
        // Views may only call tools on the server that rendered them.
        callTool: async (name, toolArgs) =>
          toCallToolResult(
            await mcpService.invokeMcpToolCall(
              {
                apiName: name,
                arguments: JSON.stringify(toolArgs),
                id: `${toolCallId}:${name}`,
                identifier: latest.current.identifier,
                type: 'mcp',
              },
              {},
            ),
          ),
        hostContext: buildHostContext(latest.current.isDark),
        onSizeChange: (nextHeight) => setHeight(Math.min(nextHeight, MAX_HEIGHT)),
        sendMessage: (text) => latest.current.sendMessage({ message: text }),
        toolInput: () => safeParseJSON(latest.current.args || '{}') ?? {},
        toolResult: () => {
          const { result: toolResult } = latest.current;
          return toCallToolResult({ ...toolResult, success: !toolResult.state?.isError });
        },
      });
      bridgeRef.current = bridge;

      return () => {
        bridgeRef.current = undefined;
        dispose();
      };
    }, [latest, srcDoc, toolCallId]);

    useEffect(() => {
      bridgeRef.current?.setHostContext(buildHostContext(isDark));
    }, [isDark]);

    if (isLoading) return <Skeleton height={DEFAULT_HEIGHT} width={'100%'} />;

    if (error || !srcDoc) {
      if (error) console.warn(`[MCPApp] failed to load ${resourceUri}:`, error);
      return fallback;
    }

    return (
      <div className={cx(resource?.meta?.prefersBorder !== false && styles.bordered)}>
        <iframe
          allow={buildAllowAttribute(resource?.meta?.permissions)}
          className={styles.iframe}
          ref={iframeRef}
          // No `allow-same-origin`: the view runs on an opaque origin and can
          // reach LobeHub only through the postMessage bridge.
          sandbox="allow-scripts allow-forms"
          srcDoc={srcDoc}
          style={{ height }}
          title={`${identifier} / ${apiName}`}
        />
      </div>
    );
  },
);

McpAppView.displayName = 'McpAppView';

export default McpAppView;
