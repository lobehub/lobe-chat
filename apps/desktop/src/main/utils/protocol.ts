import { app } from 'electron';

import { McpSchema, ProtocolUrlParsed } from '../types/protocol';

export type AppChannel = 'stable' | 'beta' | 'nightly';

export const getProtocolScheme = (): string => {
  // 在 Electron 环境中可以通过多种方式判断版本
  const bundleId = app.name;
  const appPath = app.getPath('exe');

  // 通过 bundle identifier 判断
  if (bundleId?.toLowerCase().includes('nightly')) return 'lobehub-nightly';
  if (bundleId?.toLowerCase().includes('beta')) return 'lobehub-beta';
  if (bundleId?.includes('dev')) return 'lobehub-dev';

  // 通过可执行文件路径判断
  if (appPath?.toLowerCase().includes('nightly')) return 'lobehub-nightly';
  if (appPath?.toLowerCase().includes('beta')) return 'lobehub-beta';
  if (appPath?.includes('dev')) return 'lobehub-dev';

  return 'lobehub';
};

export const getVersionInfo = (): { channel: AppChannel; protocolScheme: string } => {
  const protocolScheme = getProtocolScheme();

  let appChannel: AppChannel = 'stable';
  if (protocolScheme.includes('nightly')) {
    appChannel = 'nightly';
  } else if (protocolScheme.includes('beta')) {
    appChannel = 'beta';
  }

  return {
    channel: appChannel,
    protocolScheme,
  };
};

/**
 * 验证 MCP Schema 对象结构
 * @param schema 待验证的对象
 * @returns 是否为有效的 MCP Schema
 */
function validateMcpSchema(schema: any): schema is McpSchema {
  if (!schema || typeof schema !== 'object') return false;

  // 必填字段验证
  if (typeof schema.identifier !== 'string' || !schema.identifier) return false;
  if (typeof schema.name !== 'string' || !schema.name) return false;
  if (typeof schema.author !== 'string' || !schema.author) return false;
  if (typeof schema.description !== 'string' || !schema.description) return false;
  if (typeof schema.version !== 'string' || !schema.version) return false;

  // 可选字段验证
  if (schema.homepage !== undefined && typeof schema.homepage !== 'string') return false;
  if (schema.icon !== undefined && typeof schema.icon !== 'string') return false;

  // config 字段验证
  if (!schema.config || typeof schema.config !== 'object') return false;
  const config = schema.config;

  if (config.type === 'stdio') {
    if (typeof config.command !== 'string' || !config.command) return false;
    if (config.args !== undefined && !Array.isArray(config.args)) return false;
    if (config.env !== undefined && typeof config.env !== 'object') return false;
  } else if (config.type === 'http') {
    if (typeof config.url !== 'string' || !config.url) return false;
    try {
      new URL(config.url); // 验证URL格式
    } catch {
      return false;
    }
    if (config.headers !== undefined && typeof config.headers !== 'object') return false;
  } else {
    return false; // 未知的 config type
  }

  return true;
}

/**
 * 解析 lobehub:// 协议 URL (支持多版本协议)
 *
 * 支持的URL格式：
 * - lobehub://plugin/install?id=figma&schema=xxx&marketId=lobehub
 * - lobehub://plugin/configure?id=xxx&...
 * - lobehub-bet://plugin/install?id=figma&schema=xxx&marketId=lobehub
 * - lobehub-nightly://plugin/install?id=figma&schema=xxx&marketId=lobehub
 * - lobehub-dev://plugin/install?id=figma&schema=xxx&marketId=lobehub
 *
 * @param url 协议 URL
 * @returns 解析结果，包含基本结构和所有查询参数
 */
export const parseProtocolUrl = (url: string): ProtocolUrlParsed | null => {
  try {
    const parsedUrl = new URL(url);

    // 支持多种协议 scheme
    const validProtocols = ['lobehub:', 'lobehub-dev:', 'lobehub-nightly:', 'lobehub-beta:'];
    if (!validProtocols.includes(parsedUrl.protocol)) {
      return null;
    }

    // 对于自定义协议，URL 解析后：
    // lobehub://plugin/install -> hostname: "plugin", pathname: "/install"
    const urlType = parsedUrl.hostname; // "plugin"
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean); // ["install"]

    if (pathParts.length < 1) {
      return null;
    }

    const action = pathParts[0]; // "install"

    // 解析所有查询参数
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(parsedUrl.search);

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    return {
      action,
      originalUrl: url,
      params,
      urlType,
    };
  } catch (error) {
    console.error('Failed to parse protocol URL:', error);
    return null;
  }
};

/**
 * 生成符合 RFC 0001 的协议 URL
 *
 * @param params 协议参数
 * @returns 生成的协议URL
 */
export function generateRFCProtocolUrl(params: {
  /** 插件唯一标识符 */
  id: string;
  /** Marketplace ID */
  marketId?: string;
  /** MCP Schema 对象 */
  schema: McpSchema;
  /** 协议 scheme (默认: lobehub) */
  scheme?: string;
}): string {
  const { id, schema, marketId, scheme = 'lobehub' } = params;

  // 验证 schema.identifier 与 id 匹配
  if (schema.identifier !== id) {
    throw new Error('Schema identifier must match the id parameter');
  }

  // 验证 schema 结构
  if (!validateMcpSchema(schema)) {
    throw new Error('Invalid MCP Schema structure');
  }

  // 构建基础 URL
  const baseUrl = `${scheme}://plugin/install`;

  // 构建查询参数
  const searchParams = new URLSearchParams();

  // 必需参数
  searchParams.set('type', 'mcp');
  searchParams.set('id', id);

  // 编码 schema - 直接传 JSON 字符串，让 URLSearchParams 自动编码
  const schemaJson = JSON.stringify(schema);
  searchParams.set('schema', schemaJson);

  // 可选参数
  if (marketId) {
    searchParams.set('marketId', marketId);
  }

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * 生成协议 URL 示例
 *
 * @example
 * ```typescript
 * const url = generateRFCProtocolUrl({
 *   id: 'edgeone-mcp',
 *   schema: {
 *     identifier: 'edgeone-mcp',
 *     name: 'EdgeOne MCP',
 *     author: 'Higress Team',
 *     description: 'EdgeOne API integration for LobeChat',
 *     version: '1.0.0',
 *     config: {
 *       type: 'stdio',
 *       command: 'npx',
 *       args: ['-y', '@higress/edgeone-mcp']
 *     }
 *   },
 *   marketId: 'higress'
 * });
 * // Result: lobehub://plugin/install?id=edgeone-mcp&schema=%7B%22identifier%22%3A...&marketId=higress
 * ```
 */
