import { setupElectronApi } from './electronApi';
import { setupRouteInterceptors } from './routeInterceptor';

const setupPreload = () => {
  setupElectronApi();

  // 设置路由拦截逻辑
  window.addEventListener('DOMContentLoaded', () => {
    // 设置客户端路由拦截器
    setupRouteInterceptors();
  });
};

setupPreload();
