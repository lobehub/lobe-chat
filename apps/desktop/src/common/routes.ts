/**
 * 路由拦截类型，描述拦截路由和目标窗口的映射关系
 */
export interface RouteInterceptConfig {
  /**
   * 是否始终在新窗口中打开，即使目标窗口已经存在
   */
  alwaysOpenNew?: boolean;

  /**
   * 描述
   */
  description: string;

  /**
   * 是否启用拦截
   */
  enabled: boolean;

  /**
   * 路由模式前缀，例如 '/settings'
   */
  pathPrefix: string;

  /**
   * 目标窗口标识符
   */
  targetWindow: string;
}

/**
 * 拦截路由配置列表
 * 定义了所有需要特殊处理的路由
 */
export const interceptRoutes: RouteInterceptConfig[] = [
  {
    description: '设置页面',
    enabled: true,
    pathPrefix: '/settings',
    targetWindow: 'settings',
  },
  {
    description: '开发者工具',
    enabled: true,
    pathPrefix: '/desktop/devtools',
    targetWindow: 'devtools',
  },
  // 未来可能的其他路由
  // {
  //   description: '帮助中心',
  //   enabled: true,
  //   pathPrefix: '/help',
  //   targetWindow: 'help',
  // },
];

/**
 * 通过路径查找匹配的路由拦截配置
 * @param path 需要检查的路径
 * @returns 匹配的拦截配置，如果没有匹配则返回 undefined
 */
export const findMatchingRoute = (path: string): RouteInterceptConfig | undefined => {
  return interceptRoutes.find((route) => route.enabled && path.startsWith(route.pathPrefix));
};

/**
 * 从完整路径中提取子路径
 * @param fullPath 完整路径，如 '/settings/agent'
 * @param pathPrefix 路径前缀，如 '/settings'
 * @returns 子路径，如 'agent'
 */
export const extractSubPath = (fullPath: string, pathPrefix: string): string | undefined => {
  if (fullPath.length <= pathPrefix.length) return undefined;

  // 去除前导斜杠
  const subPath = fullPath.slice(Math.max(0, pathPrefix.length + 1));
  return subPath || undefined;
};
