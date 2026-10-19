import type {
  McpUiResourceCsp,
  McpUiResourceMeta,
} from '@modelcontextprotocol/ext-apps/app-bridge';
import type { CallToolResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import type { MCPToolCallResult } from '@/libs/mcp/types';

export interface McpAppResource {
  html: string;
  meta?: McpUiResourceMeta;
}

const decodeBase64 = (value: string) => {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

/**
 * Pick the HTML document out of a `resources/read` result. Prefers the entry
 * matching `uri`; accepts text or base64 blob contents.
 */
export const pickAppResource = (
  result: ReadResourceResult | undefined,
  uri: string,
): McpAppResource | undefined => {
  const contents = result?.contents ?? [];
  const content = contents.find((item) => item.uri === uri) ?? contents[0];
  if (!content) return;

  let html: string | undefined;
  if ('text' in content && typeof content.text === 'string') html = content.text;
  else if ('blob' in content && typeof content.blob === 'string') html = decodeBase64(content.blob);
  if (!html) return;

  const meta = (content._meta as { ui?: McpUiResourceMeta } | undefined)?.ui;

  return { html, meta };
};

/** Only http(s) origins without CSP-breaking characters make it into the policy. */
const sanitizeSources = (sources: string[] | undefined) =>
  (sources ?? []).filter((source) => /^(?:https?|wss?):\/\/[\w*.:-]+(?:\/[\w./-]*)?$/.test(source));

/**
 * CSP for the view document, built from the domains the resource declares.
 * Undeclared means no network access, per the MCP Apps spec.
 */
export const buildAppCsp = (csp: McpUiResourceCsp | undefined): string => {
  const resources = sanitizeSources(csp?.resourceDomains).join(' ');
  const connect = sanitizeSources(csp?.connectDomains).join(' ');
  const frames = sanitizeSources(csp?.frameDomains).join(' ');
  const inline = `'unsafe-inline'`;

  return [
    `default-src 'none'`,
    `script-src ${inline} ${resources}`.trim(),
    `style-src ${inline} ${resources}`.trim(),
    `img-src data: blob: ${resources}`.trim(),
    `font-src data: ${resources}`.trim(),
    `media-src data: blob: ${resources}`.trim(),
    `connect-src ${connect || `'none'`}`,
    `frame-src ${frames || `'none'`}`,
    `base-uri 'none'`,
    `form-action 'none'`,
  ].join('; ');
};

const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

/**
 * Prepend the CSP `<meta>` so it is the first thing the parser sees; a policy
 * declared after a script would not apply to that script.
 */
export const injectCsp = (html: string, csp: string): string => {
  const tag = `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(csp)}">`;

  const head = /<head[^>]*>/i.exec(html);
  if (head)
    return (
      html.slice(0, head.index + head[0].length) + tag + html.slice(head.index + head[0].length)
    );

  return tag + html;
};

/** Map LobeHub's tool call envelope back to the MCP `CallToolResult` a view expects. */
export const toCallToolResult = (
  result:
    | (Pick<MCPToolCallResult, 'content' | 'success'> & { state?: MCPToolCallResult['state'] })
    | undefined,
): CallToolResult => {
  const state = result?.state as (CallToolResult & { mcpApp?: unknown }) | undefined;

  if (!state || !Array.isArray(state.content)) {
    return {
      content: [{ text: result?.content ?? '', type: 'text' }],
      isError: result ? !result.success : true,
    };
  }

  const { mcpApp: _mcpApp, ...rest } = state;
  void _mcpApp;

  return rest;
};
