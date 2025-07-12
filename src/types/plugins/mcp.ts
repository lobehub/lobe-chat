import { PluginQueryParams, SystemDependency } from '@lobehub/market-sdk';

import { MCPInstallStep } from '@/store/tool/slices/mcpStore';

export interface CheckMcpInstallParams {
  /**
   * 安装详情
   */
  installationDetails: {
    packageName?: string;
    repositoryUrlToClone?: string;
    setupSteps?: string[];
  };
  /**
   * 安装方法
   */
  installationMethod: string;
  /**
   * 系统依赖项
   */
  systemDependencies?: SystemDependency[];
}

export interface CheckMcpInstallResult {
  allDependenciesMet?: boolean;
  /**
   * 所有部署选项的检查结果
   */
  allOptions?: Array<{
    allDependenciesMet?: boolean;
    /**
     * 连接信息，用于后续连接使用
     */
    connection?: {
      args?: string[];
      command?: string;
      installationMethod: string;
      packageName?: string;
      repositoryUrl?: string;
    };
    isRecommended?: boolean;
    packageInstalled?: boolean;
    systemDependencies?: Array<{
      error?: string;
      installed: boolean;
      meetRequirement: boolean;
      name: string;
      version?: string;
    }>;
  }>;
  /**
   * 配置模式，提到顶层方便访问
   */
  configSchema?: any;
  /**
   * 连接信息，用于后续连接使用
   */
  connection?: {
    args?: string[];
    command?: string;
    type: 'stdio' | 'http';
    url?: string;
  };
  /**
   * 如果检测失败，提供错误信息
   */
  error?: string;
  /**
   * 是否为推荐选项
   */
  isRecommended?: boolean;
  /**
   * 是否需要配置（如 API key 等）
   */
  needsConfig?: boolean;
  /**
   * 插件安装检测结果
   */
  packageInstalled?: boolean;
  platform: string;
  /**
   * 检测结果是否成功
   */
  success: boolean;
  /**
   * 系统依赖检测结果
   */
  systemDependencies?: Array<{
    error?: string;
    installed: boolean;
    meetRequirement: boolean;
    name: string;
    version?: string;
  }>;
}

export type MCPPluginListParams = Pick<PluginQueryParams, 'locale' | 'pageSize' | 'page' | 'q'>;

export interface MCPErrorInfoMetadata {
  errorLog?: string;

  /**
   * 原始错误信息
   */
  originalError?: string;

  /**
   * MCP 连接参数
   */
  params?: {
    args?: string[];
    command?: string;
    type?: string;
  };
  /**
   * 进程相关信息
   */
  process?: {
    exitCode?: number;
    signal?: string;
  };

  /**
   * 错误发生的步骤
   */
  step?: string;

  /**
   * 时间戳
   */
  timestamp?: number;
}
/**
 * 结构化的错误信息
 */
export interface MCPErrorInfo {
  /**
   * 核心错误信息（用户友好的简短描述）
   */
  message: string;

  /**
   * 结构化的错误元数据
   */
  metadata?: MCPErrorInfoMetadata;

  /**
   * 错误类型
   */
  type:
    | 'CONNECTION_FAILED'
    | 'PROCESS_SPAWN_ERROR'
    | 'INITIALIZATION_TIMEOUT'
    | 'VALIDATION_ERROR'
    | 'UNKNOWN_ERROR';
}

export interface MCPInstallProgress {
  checkResult?: CheckMcpInstallResult;
  configSchema?: any;
  // connection info from checkInstallation
  connection?: any;
  // 结构化的错误信息，当安装失败时显示
  errorInfo?: MCPErrorInfo;
  manifest?: any;
  // LobeChatPluginManifest
  needsConfig?: boolean;
  // 0-100
  progress: number;
  step: MCPInstallStep;
  // 系统依赖检测结果，当需要安装依赖时显示
  systemDependencies?: Array<{
    error?: string;
    installInstructions?: {
      current?: string; // 当前系统的安装指令
      manual?: string; // 手动安装指令
    };
    installed: boolean;
    meetRequirement: boolean;
    name: string;
    requiredVersion?: string;
    type?: string;
    version?: string;
    versionParsingRequired?: boolean;
  }>;
}

export type MCPInstallProgressMap = Record<string, MCPInstallProgress | undefined>;
