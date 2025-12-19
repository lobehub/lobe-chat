import { InterceptRouteParams, InterceptRouteResponse } from '../types/route';

export interface OpenSettingsWindowOptions {
  /**
   * Query parameters that should be appended to the settings URL.
   */
  searchParams?: Record<string, string | undefined>;
  /**
   * Settings page tab path or identifier.
   */
  tab?: string;
}

export interface CreateMultiInstanceWindowParams {
  path: string;
  templateId: string;
  uniqueId?: string;
}

export interface CreateMultiInstanceWindowResponse {
  error?: string;
  success: boolean;
  windowId?: string;
}

export interface GetWindowsByTemplateResponse {
  error?: string;
  success: boolean;
  windowIds?: string[];
}

export interface WindowsDispatchEvents {
  /**
   * Close all windows by template
   * @param templateId Template identifier
   * @returns Operation result
   */
  closeWindowsByTemplate: (templateId: string) => { error?: string; success: boolean };

  /**
   * Create a new multi-instance window
   * @param params Window creation parameters
   * @returns Creation result
   */
  createMultiInstanceWindow: (
    params: CreateMultiInstanceWindowParams,
  ) => CreateMultiInstanceWindowResponse;

  /**
   * Get all windows by template
   * @param templateId Template identifier
   * @returns List of window identifiers
   */
  getWindowsByTemplate: (templateId: string) => GetWindowsByTemplateResponse;

  /**
   * Intercept client-side route navigation request
   * @param params Parameter object containing path and source information
   * @returns Route interception result
   */
  interceptRoute: (params: InterceptRouteParams) => InterceptRouteResponse;

  /**
   * open the LobeHub Devtools
   */
  openDevtools: () => void;

  openSettingsWindow: (options?: OpenSettingsWindowOptions | string) => void;
}
