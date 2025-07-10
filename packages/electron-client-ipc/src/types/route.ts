export interface InterceptRouteParams {
  /**
   * 请求路径
   */
  path: string;
  /**
   * 来源类型：'link-click', 'push-state', 'replace-state'
   */
  source: 'link-click' | 'push-state' | 'replace-state';
  /**
   * 完整URL
   */
  url: string;
}

export interface InterceptRouteResponse {
  /**
   * 错误信息 (如果有)
   */
  error?: string;

  /**
   * 是否已拦截
   */
  intercepted: boolean;

  /**
   * 原始路径
   */
  path: string;

  /**
   * 原始来源
   */
  source: string;

  /**
   * 子路径 (如果有)
   */
  subPath?: string;

  /**
   * 目标窗口标识符
   */
  targetWindow?: string;
}
