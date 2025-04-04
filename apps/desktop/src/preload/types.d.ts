// 扩展全局类型
interface Window {
  // 将被路由拦截器使用的全局属性
  electronAPI: {
    invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
  };
}
