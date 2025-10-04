import { InterceptRouteParams, InterceptRouteResponse } from '../types/route';

export interface CreateMultiInstanceWindowParams {
  templateId: string;
  path: string;
  uniqueId?: string;
}

export interface CreateMultiInstanceWindowResponse {
  success: boolean;
  windowId?: string;
  error?: string;
}

export interface GetWindowsByTemplateResponse {
  success: boolean;
  windowIds?: string[];
  error?: string;
}

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

  /**
   * Create a new multi-instance window
   * @param params Window creation parameters
   * @returns Creation result
   */
  createMultiInstanceWindow: (params: CreateMultiInstanceWindowParams) => CreateMultiInstanceWindowResponse;

  /**
   * Get all windows by template
   * @param templateId Template identifier
   * @returns List of window identifiers
   */
  getWindowsByTemplate: (templateId: string) => GetWindowsByTemplateResponse;

  /**
   * Close all windows by template
   * @param templateId Template identifier
   * @returns Operation result
   */
  closeWindowsByTemplate: (templateId: string) => { success: boolean; error?: string };
}
