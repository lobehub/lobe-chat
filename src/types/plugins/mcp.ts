import { SystemDependency } from '@lobehub/market-sdk';

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
   * 如果检测失败，提供错误信息
   */
  error?: string;
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
