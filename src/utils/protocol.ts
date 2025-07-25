import { McpSchema, ProtocolSource, ProtocolUrlParsed } from '@/types/plugins/protocol';

/**
 * 根据应用版本获取协议 scheme
 */
export function getProtocolScheme(): string {
  // 在桌面端环境中，可以通过环境变量或其他方式判断版本
  if (typeof process !== 'undefined' && process.env) {
    const packageName = process.env.npm_package_name;
    if (packageName?.includes('nightly')) return 'lobehub-nightly';
    if (packageName?.includes('beta')) return 'lobehub-beta';
    if (packageName?.includes('dev')) return 'lobehub-dev';
  }

  return 'lobehub';
}

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
 * 将 marketId 映射到 ProtocolSource
 */
function mapMarketIdToSource(marketId?: string): ProtocolSource {
  if (!marketId) return ProtocolSource.THIRD_PARTY; // 未知来源

  // 根据 marketId 映射到对应的 source
  const marketSourceMap: Record<string, ProtocolSource> = {
    higress: ProtocolSource.THIRD_PARTY,
    lobehub: ProtocolSource.OFFICIAL,
    smithery: ProtocolSource.THIRD_PARTY,
    // 可以添加更多映射
  };

  return marketSourceMap[marketId.toLowerCase()] || ProtocolSource.THIRD_PARTY;
}

/**
 * 解析 lobehub:// 协议 URL (支持多版本协议)
 *
 * 支持的URL格式：
 * - lobehub://plugin/install?id=figma&schema=xxx&marketId=lobehub
 * - lobehub://plugin/install?id=xxx&...
 * - lobehub-nightly://plugin/install?id=figma&schema=xxx&marketId=lobehub
 * - lobehub-beta://plugin/install?id=figma&schema=xxx&marketId=lobehub
 *
 * @param url 协议 URL
 * @returns 解析结果
 */
export function parseProtocolUrl(url: string): ProtocolUrlParsed | null {
  try {
    const parsedUrl = new URL(url);

    // 支持多种协议 scheme
    const validProtocols = ['lobehub:', 'lobehub-dev:', 'lobehub-nightly:', 'lobehub-beta:'];
    if (!validProtocols.includes(parsedUrl.protocol)) {
      return null;
    }

    // 对于自定义协议，URL 解析后：
    // lobehub://plugin/install -> hostname: "plugin", pathname: "/install"
    // 我们需要结合 hostname 和 pathname 来构造完整路径
    const urlType = parsedUrl.hostname; // "plugin"
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean); // ["install"]

    if (pathParts.length < 1) {
      return null;
    }

    const action = pathParts[0]; // "install"

    // RFC 要求路径为 /plugin/install
    if (urlType !== 'plugin' || action !== 'install') {
      return null;
    }

    // 解析查询参数
    const searchParams = new URLSearchParams(parsedUrl.search);

    // 验证必需参数
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const schemaParam = searchParams.get('schema');

    if (type !== 'mcp' || !id || !schemaParam) {
      return null;
    }

    // 解码和解析 schema
    let mcpSchema: McpSchema;
    try {
      // URLSearchParams.get() 已经自动解码了，不需要再次解码
      mcpSchema = JSON.parse(schemaParam);
    } catch (error) {
      console.error('Failed to parse schema:', error);
      return null;
    }

    // 验证 schema
    if (!validateMcpSchema(mcpSchema)) {
      console.error('Invalid MCP Schema structure');
      return null;
    }

    // 验证 identifier 与 id 参数匹配
    if (mcpSchema.identifier !== id) {
      console.error('Schema identifier does not match URL id parameter');
      return null;
    }

    // 解析可选参数
    const marketId = searchParams.get('marketId') || undefined;

    // 映射协议来源
    const source = mapMarketIdToSource(marketId);

    // 返回符合新接口的对象
    return {
      action: 'install',
      params: {
        id,
        marketId,
        type,
      },
      schema: mcpSchema,
      source,
      type: 'mcp',
      urlType,
    };
  } catch (error) {
    console.error('Failed to parse RFC protocol URL:', error);
    return null;
  }
}

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
 * 验证协议来源是否可信
 *
 * @param source 协议来源
 * @returns 是否可信
 */
export function isProtocolSourceTrusted(source: ProtocolSource): boolean {
  switch (source) {
    case ProtocolSource.OFFICIAL:
    case ProtocolSource.GITHUB_OFFICIAL: {
      return true;
    }

    case ProtocolSource.COMMUNITY: {
      // 可以在这里添加白名单验证
      return true;
    }

    case ProtocolSource.THIRD_PARTY:
    case ProtocolSource.DEVELOPER: {
      // 第三方来源需要用户确认
      return false;
    }

    default: {
      return false;
    }
  }
}
