'use client';

import { safeParseJSON } from '@lobechat/utils';
import {
  Button,
  createModal,
  createStaticStyles,
  cssVar,
  cx,
  Flexbox,
  Skeleton,
} from '@lobehub/ui';
import { type AppBridge, buildAllowAttribute } from '@modelcontextprotocol/ext-apps/app-bridge';
import { useLatest } from 'ahooks';
import { memo, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useConversationStore } from '@/features/Conversation/store';
import { useIsDark } from '@/hooks/useIsDark';
import { useClientDataSWR } from '@/libs/swr';
import { mcpAppKeys } from '@/libs/swr/keys';
import { mcpService } from '@/services/mcp';

import { buildHostContext, connectMcpAppBridge } from './bridge';
import { getAppToolCallPolicy } from './toolCallPolicy';
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

/** Resolves false on Cancel and on any other dismissal (Esc, mask, close). */
const confirmAppToolCall = (texts: {
  cancelText: string;
  content: string;
  okText: string;
  title: string;
}) =>
  new Promise<boolean>((resolve) => {
    let settled = false;
    const settle = (allowed: boolean) => {
      if (settled) return;
      settled = true;
      resolve(allowed);
      modal.close();
    };
    const modal = createModal({
      content: texts.content,
      footer: (
        <Flexbox horizontal gap={8} justify={'flex-end'}>
          <Button onClick={() => settle(false)}>{texts.cancelText}</Button>
          <Button type={'primary'} onClick={() => settle(true)}>
            {texts.okText}
          </Button>
        </Flexbox>
      ),
      onOpenChange: (open) => {
        if (!open) settle(false);
      },
      title: texts.title,
    });
  });

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
    const agentId = useConversationStore((s) => s.context.agentId) || undefined;
    const { t } = useTranslation('plugin');

    const { data, error, isLoading } = useClientDataSWR(
      mcpAppKeys.resource(identifier, resourceUri, agentId),
      () => mcpService.readMcpAppResource(identifier, resourceUri, agentId),
      { revalidateOnFocus: false, revalidateOnReconnect: false },
    );

    const resource = useMemo(() => pickAppResource(data, resourceUri), [data, resourceUri]);
    const srcDoc = useMemo(
      () => resource && injectCsp(resource.html, buildAppCsp(resource.meta?.csp)),
      [resource],
    );

    // Everything the bridge reads after mount goes through a ref, so the
    // iframe session is created once per document instead of per render.
    const latest = useLatest({ agentId, args, identifier, isDark, result, sendMessage, t });
    const bridgeRef = useRef<AppBridge>(undefined);

    useEffect(() => {
      const target = iframeRef.current?.contentWindow;
      if (!srcDoc || !target) return;

      const { bridge, dispose } = connectMcpAppBridge(target, {
        // Views may only call tools on the server that rendered them, and
        // under the same approval rules as the conversation.
        callTool: async (name, toolArgs) => {
          const { agentId: currentAgentId, identifier: currentIdentifier, t: tr } = latest.current;
          const policy = getAppToolCallPolicy(currentIdentifier, name, currentAgentId);
          const allowed =
            policy === 'allow' ||
            (policy === 'confirm' &&
              (await confirmAppToolCall({
                cancelText: tr('mcpApp.toolCall.confirm.cancel'),
                content: tr('mcpApp.toolCall.confirm.content', {
                  app: currentIdentifier,
                  tool: name,
                }),
                okText: tr('mcpApp.toolCall.confirm.ok'),
                title: tr('mcpApp.toolCall.confirm.title'),
              })));

          if (!allowed) {
            return {
              content: [{ text: tr('mcpApp.toolCall.rejected', { tool: name }), type: 'text' }],
              isError: true,
            };
          }

          return toCallToolResult(
            await mcpService.invokeMcpToolCall(
              {
                apiName: name,
                arguments: JSON.stringify(toolArgs),
                id: `${toolCallId}:${name}`,
                identifier: currentIdentifier,
                type: 'mcp',
              },
              { agentId: currentAgentId },
            ),
          );
        },
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
