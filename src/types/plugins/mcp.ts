import { PluginQueryParams, SystemDependency } from '@lobehub/market-sdk';

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
   * 插件安装检测结果
   */
  packageInstalled?: boolean;
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
