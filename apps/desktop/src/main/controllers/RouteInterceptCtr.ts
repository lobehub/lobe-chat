import { InterceptRouteParams } from '@lobechat/electron-client-ipc';

import { AppBrowsersIdentifiers } from '@/appBrowsers';

import { findMatchingRoute } from '../../common/routes';
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

    // try {
    //   // 提取子路径
    //   const subPath = extractSubPath(path, matchedRoute.pathPrefix);
    //
    //   // 打开对应的窗口
    //   await this.openTargetWindow(matchedRoute.targetWindow as AppBrowsersIdentifiers, subPath);
    //
    //   return {
    //     intercepted: true,
    //     path,
    //     source,
    //     subPath,
    //     targetWindow: matchedRoute.targetWindow,
    //   };
    // } catch (error) {
    //   console.error('[RouteInterceptCtr] 处理路由拦截时出错:', error);
    //   return {
    //     error: error.message,
    //     intercepted: false,
    //     path,
    //     source,
    //   };
    // }
  }

  /**
   * 打开目标窗口并导航到指定子路径
   */
  private async openTargetWindow(targetWindow: AppBrowsersIdentifiers, subPath?: string) {
    // 使用 redirectToTab 方法，它会确保窗口存在或创建它
    try {
      if (subPath) {
        this.app.browserManager.redirectToTab(targetWindow, subPath);
      } else {
        // 这里确保窗口始终能被创建或重新打开
        const browser = this.app.browserManager.retrieveByIdentifier(targetWindow);
        browser.show();
      }
    } catch (error) {
      console.error(`[RouteInterceptCtr] 打开窗口 ${targetWindow} 失败:`, error);
      throw new Error(`无法打开窗口: ${error.message}`);
    }
  }
}
