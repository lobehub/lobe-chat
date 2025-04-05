import { InterceptRouteParams } from '@lobechat/electron-client-ipc';
import { extractSubPath, findMatchingRoute } from '~common/routes';

import { AppBrowsersIdentifiers, BrowsersIdentifiers } from '@/appBrowsers';

import { ControllerModule, ipcClientEvent } from './index';

/**
 * 路由拦截控制器
 * 负责处理渲染进程的路由拦截请求
 */
export default class RouteInterceptCtr extends ControllerModule {
  /**
   * 处理路由拦截请求
   * 使用装饰器注册为IPC方法
   */
  @ipcClientEvent('interceptRoute')
  async interceptRoute(params: InterceptRouteParams) {
    const { path, source } = params;
    console.log(`[RouteInterceptCtr] 接收到路由拦截请求: ${path}，来源: ${source}`);

    // 查找匹配的路由配置
    const matchedRoute = findMatchingRoute(path);

    // 如果没有匹配的路由，返回未拦截
    if (!matchedRoute) {
      console.log(`[RouteInterceptCtr] 未找到匹配的路由配置: ${path}`);
      return { intercepted: false, path, source };
    }

    console.log(`[RouteInterceptCtr] 拦截到路由: ${path}，目标窗口: ${matchedRoute.targetWindow}`);

    try {
      if (matchedRoute.targetWindow === BrowsersIdentifiers.settings) {
        const subPath = extractSubPath(path, matchedRoute.pathPrefix);

        await this.app.browserManager.showSettingsWindowWithTab(subPath);

        return {
          intercepted: true,
          path,
          source,
          subPath,
          targetWindow: matchedRoute.targetWindow,
        };
      } else {
        await this.openTargetWindow(matchedRoute.targetWindow as AppBrowsersIdentifiers);

        return {
          intercepted: true,
          path,
          source,
          targetWindow: matchedRoute.targetWindow,
        };
      }
    } catch (error) {
      console.error('[RouteInterceptCtr] 处理路由拦截时出错:', error);
      return {
        error: error.message,
        intercepted: false,
        path,
        source,
      };
    }
  }

  /**
   * 打开目标窗口并导航到指定子路径
   */
  private async openTargetWindow(targetWindow: AppBrowsersIdentifiers) {
    // 这里确保窗口始终能被创建或重新打开
    const browser = this.app.browserManager.retrieveByIdentifier(targetWindow);
    browser.show();
  }
}
