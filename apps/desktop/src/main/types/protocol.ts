/**
 * MCP Schema - stdio 配置类型
 */
export interface McpStdioConfig {
  args?: string[];
  command: string;
  env?: Record<string, string>;
  type: 'stdio';
}

/**
 * MCP Schema - http 配置类型
 */
export interface McpHttpConfig {
  headers?: Record<string, string>;
  type: 'http';
  url: string;
}

/**
 * MCP Schema 配置类型
 */
export type McpConfig = McpStdioConfig | McpHttpConfig;

/**
 * MCP Schema 对象
 * 符合 RFC 0001 定义
 */
export interface McpSchema {
  /** 插件作者 */
  author: string;
  /** 插件配置 */
  config: McpConfig;
  /** 插件描述 */
  description: string;
  /** 插件主页 */
  homepage?: string;
  /** 插件图标 */
  icon?: string;
  /** 插件唯一标识符，必须与URL中的id参数匹配 */
  identifier: string;
  /** 插件名称 */
  name: string;
  /** 插件版本 (semver) */
  version: string;
}

/**
 * 协议URL解析结果
 */
export interface ProtocolUrlParsed {
  /** 操作类型 (如: 'install') */
  action: string;
  /** 原始URL */
  originalUrl: string;
  /** 解析后的所有查询参数 */
  params: Record<string, string>;
  /** URL类型 (如: 'plugin') */
  urlType: string;
}
