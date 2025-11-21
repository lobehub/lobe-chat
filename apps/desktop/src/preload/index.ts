import { setupElectronApi } from './electronApi';
import { setupRouteInterceptors } from './routeInterceptor';

const setupPreload = () => {
  setupElectronApi();

  // Setup route interception logic
  window.addEventListener('DOMContentLoaded', () => {
    // Setup client-side route interceptor
    setupRouteInterceptors();
  });
};

setupPreload();
