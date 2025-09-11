import { CategoryItem, CategoryListQuery, PluginManifest } from '@lobehub/market-sdk';
import { CallReportRequest, InstallReportRequest } from '@lobehub/market-types';

import { lambdaClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import {
  AssistantListResponse,
  AssistantQueryParams,
  DiscoverAssistantDetail,
  DiscoverMcpDetail,
  DiscoverModelDetail,
  DiscoverPluginDetail,
  DiscoverProviderDetail,
  IdentifiersResponse,
  McpListResponse,
  McpQueryParams,
  ModelListResponse,
  ModelQueryParams,
  PluginListResponse,
  PluginQueryParams,
  ProviderListResponse,
  ProviderQueryParams,
} from '@/types/discover';
import { MCPPluginListParams } from '@/types/plugins';
import { cleanObject } from '@/utils/object';

class DiscoverService {
  private _isRetrying = false;

  // ============================== Assistant Market ==============================
  getAssistantCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getAssistantCategories.query({
      ...params,
      locale,
    });
  };

  getAssistantDetail = async (params: {
    identifier: string;
    locale?: string;
  }): Promise<DiscoverAssistantDetail | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getAssistantDetail.query({
      ...params,
      locale,
    });
  };

  getAssistantIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getAssistantIdentifiers.query();
  };

  getAssistantList = async (params: AssistantQueryParams = {}): Promise<AssistantListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getAssistantList.query(
      {
        ...params,
        locale,
        page: params.page ? Number(params.page) : 1,
        pageSize: params.pageSize ? Number(params.pageSize) : 20,
      },
      { context: { showNotification: false } },
    );
  };

  // ============================== MCP Market ==============================

  getMcpCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getMcpCategories.query({
      ...params,
      locale,
    });
  };

  getMcpDetail = async (params: {
    identifier: string;
    locale?: string;
    version?: string;
  }): Promise<DiscoverMcpDetail> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getMcpDetail.query({
      ...params,
      locale,
    });
  };

  getMcpList = async (params: McpQueryParams = {}): Promise<McpListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getMcpList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };

  getMCPPluginList = async (params: MCPPluginListParams): Promise<McpListResponse> => {
    await this.injectMPToken();

    const locale = globalHelpers.getCurrentLanguage();

    return lambdaClient.market.getMcpList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 21,
    });
  };

  getMcpManifest = async (params: { identifier: string; locale?: string; version?: string }) => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getMcpManifest.query({
      ...params,
      locale,
    });
  };

  getMCPPluginManifest = async (
    identifier: string,
    options: { install?: boolean } = {},
  ): Promise<PluginManifest> => {
    const locale = globalHelpers.getCurrentLanguage();

    return lambdaClient.market.getMcpManifest.query({
      identifier,
      install: options.install,
      locale,
    });
  };

  registerClient = () => {
    return lambdaClient.market.registerClientInMarketplace.mutate({});
  };

  /**
   * 上报 MCP 插件安装结果
   */
  reportMcpInstallResult = async ({
    success,
    manifest,
    errorMessage,
    errorCode,
    ...params
  }: InstallReportRequest) => {
    // if user don't allow tracing, just not report installation
    const allow = preferenceSelectors.userAllowTrace(useUserStore.getState());

    if (!allow) return;
    await this.injectMPToken();

    const reportData = {
      errorCode: success ? undefined : errorCode,
      errorMessage: success ? undefined : errorMessage,
      manifest: success ? manifest : undefined,
      success,
      ...params,
    };

    lambdaClient.market.reportMcpInstallResult
      .mutate(cleanObject(reportData))
      .catch((reportError) => {
        console.warn('Failed to report MCP installation result:', reportError);
      });
  };

  /**
   * 上报插件调用结果
   */
  reportPluginCall = async (reportData: CallReportRequest) => {
    // if user don't allow tracing , just not report calling
    const allow = preferenceSelectors.userAllowTrace(useUserStore.getState());

    if (!allow) return;

    await this.injectMPToken();

    lambdaClient.market.reportCall.mutate(cleanObject(reportData)).catch((reportError) => {
      console.warn('Failed to report call:', reportError);
    });
  };

  // ============================== Models ==============================

  getModelCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    return lambdaClient.market.getModelCategories.query(params);
  };

  getModelDetail = async (params: {
    identifier: string;
    locale?: string;
  }): Promise<DiscoverModelDetail | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getModelDetail.query({
      ...params,
      locale,
    });
  };

  getModelIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getModelIdentifiers.query();
  };

  getModelList = async (params: ModelQueryParams = {}): Promise<ModelListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getModelList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };

  // ============================== Plugin Market ==============================

  getPluginCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getPluginCategories.query({
      ...params,
      locale,
    });
  };

  getPluginDetail = async (params: {
    identifier: string;
    locale?: string;
    withManifest?: boolean;
  }): Promise<DiscoverPluginDetail | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getPluginDetail.query({
      ...params,
      locale,
    });
  };

  getPluginIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getPluginIdentifiers.query();
  };

  getPluginList = async (params: PluginQueryParams = {}): Promise<PluginListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getPluginList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };

  // ============================== Providers ==============================

  getProviderDetail = async (params: {
    identifier: string;
    locale?: string;
    withReadme?: boolean;
  }): Promise<DiscoverProviderDetail | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getProviderDetail.query({
      ...params,
      locale,
    });
  };

  getProviderIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getProviderIdentifiers.query();
  };

  getProviderList = async (params: ProviderQueryParams = {}): Promise<ProviderListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getProviderList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };

  // ============================== Helpers ==============================

  private async injectMPToken() {
    if (typeof localStorage === 'undefined') return;

    // 检查服务端设置的状态标记 cookie
    const tokenStatus = this.getTokenStatusFromCookie();
    if (tokenStatus === 'active') return;

    let clientId: string;
    let clientSecret: string;

    // 1. 从 localStorage 获取客户端信息
    const item = localStorage.getItem('_mpc');
    if (!item) {
      // 2. 如果没有，则注册客户端
      const clientInfo = await this.registerClient();
      clientId = clientInfo.clientId;
      clientSecret = clientInfo.clientSecret;

      // 3. Base64 编码并保存到 localStorage
      const clientData = JSON.stringify({ clientId, clientSecret });
      const encodedData = btoa(clientData);
      localStorage.setItem('_mpc', encodedData);
    } else {
      // 4. 如果有，则解码获取客户端信息
      try {
        const decodedData = atob(item);
        const clientData = JSON.parse(decodedData);
        clientId = clientData.clientId;
        clientSecret = clientData.clientSecret;
      } catch (error) {
        console.error('Failed to decode client data:', error);
        // 如果解码失败，重新注册
        const clientInfo = await this.registerClient();
        clientId = clientInfo.clientId;
        clientSecret = clientInfo.clientSecret;

        const clientData = JSON.stringify({ clientId, clientSecret });
        const encodedData = btoa(clientData);
        localStorage.setItem('_mpc', encodedData);
      }
    }

    // 5. 获取访问令牌（服务端会自动设置 HTTP-Only cookie）
    try {
      const result = await lambdaClient.market.registerM2MToken.query({
        clientId,
        clientSecret,
      });

      // 检查服务端返回的结果
      if (!result.success) {
        console.warn(
          'Token registration failed, client credentials may be invalid. Clearing and retrying...',
        );

        // 清空相关的本地存储数据
        localStorage.removeItem('_mpc');

        // 重新执行完整的注册流程（但只重试一次）
        if (!this._isRetrying) {
          this._isRetrying = true;
          try {
            await this.injectMPToken();
          } finally {
            this._isRetrying = false;
          }
        } else {
          console.error('Failed to re-register after credential invalidation');
        }

        return;
      }
    } catch (error) {
      console.error('Failed to register M2M token:', error);
      return null;
    }
  }

  private getTokenStatusFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'mp_token_status') {
        return value;
      }
    }
    return null;
  }
}

export const discoverService = new DiscoverService();
