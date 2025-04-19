import { InterceptRouteParams, InterceptRouteResponse } from '../types/route';

export interface WindowsDispatchEvents {
  /**
   * 拦截客户端路由导航请求
   * @param params 包含路径和来源信息的参数对象
   * @returns 路由拦截结果
   */
  interceptRoute: (params: InterceptRouteParams) => InterceptRouteResponse;

  /**
   * open the LobeHub Devtools
   */
  openDevtools: () => void;

  openSettingsWindow: (tab?: string) => void;
}
