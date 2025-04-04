import { findMatchingRoute } from '~common/routes';

import { invoke } from './invoke';

const interceptRoute = async (
  path: string,
  source: 'link-click' | 'push-state' | 'replace-state',
  url: string,
) => {
  console.log(`[preload] 拦截到 ${source} 并阻止默认行为:`, path);

  // 使用electron-client-ipc的dispatch方法
  try {
    await invoke('interceptRoute', { path, source, url });
  } catch (e) {
    console.error(`[preload] 路由拦截(${source})调用失败`, e);
  }
};
/**
 * 路由拦截器 - 负责捕获和拦截客户端路由导航
 */
export const setupRouteInterceptors = function () {
  console.log('[preload] 设置路由拦截器');

  // 存储被阻止的路径，避免pushState重复触发
  const preventedPaths = new Set<string>();

  // 拦截所有a标签的点击事件 - 针对Next.js的Link组件
  document.addEventListener(
    'click',
    async (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href);

          // 使用共享配置检查是否需要拦截
          const matchedRoute = findMatchingRoute(url.pathname);

          // 如果是需要拦截的路径，立即阻止默认行为
          if (matchedRoute) {
            // 立即阻止默认行为，避免Next.js接管路由
            e.preventDefault();
            e.stopPropagation();

            await interceptRoute(url.pathname, 'link-click', link.href);

            return false;
          }
        } catch (err) {
          console.error('[preload] 链接拦截错误:', err);
        }
      }
    },
    true,
  );

  // 拦截 history API (用于捕获Next.js的useRouter().push/replace等)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  // 重写pushState
  history.pushState = function () {
    const url = arguments[2];
    if (typeof url === 'string') {
      try {
        // 只处理相对路径或当前域的URL
        const parsedUrl = new URL(url, window.location.origin);

        // 使用共享配置检查是否需要拦截
        const matchedRoute = findMatchingRoute(parsedUrl.pathname);

        // 检查是否需要拦截这个导航
        if (matchedRoute) {
          // 将此路径添加到已阻止集合中
          preventedPaths.add(parsedUrl.pathname);

          interceptRoute(parsedUrl.pathname, 'push-state', parsedUrl.href);

          // 不执行原始的pushState操作，阻止导航发生
          // 但返回undefined以避免错误
          return;
        }
      } catch (err) {
        console.error('[preload] pushState拦截错误:', err);
      }
    }
    return Reflect.apply(originalPushState, this, arguments);
  };

  // 重写replaceState
  history.replaceState = function () {
    const url = arguments[2];
    if (typeof url === 'string') {
      try {
        const parsedUrl = new URL(url, window.location.origin);

        // 使用共享配置检查是否需要拦截
        const matchedRoute = findMatchingRoute(parsedUrl.pathname);

        // 检查是否需要拦截这个导航
        if (matchedRoute) {
          // 添加到已阻止集合
          preventedPaths.add(parsedUrl.pathname);

          interceptRoute(parsedUrl.pathname, 'replace-state', parsedUrl.href);

          // 阻止导航
          return;
        }
      } catch (err) {
        console.error('[preload] replaceState拦截错误:', err);
      }
    }
    return Reflect.apply(originalReplaceState, this, arguments);
  };

  // 监听并拦截路由错误 - 有时Next.js会在路由错误时尝试恢复导航
  window.addEventListener(
    'error',
    function (e) {
      if (e.message && e.message.includes('navigation') && preventedPaths.size > 0) {
        console.log('[preload] 捕获到可能的路由错误，阻止默认行为');
        e.preventDefault();
      }
    },
    true,
  );

  console.log('[preload] 路由拦截器设置完成');
};
