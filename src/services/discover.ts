import { CategoryItem, CategoryListQuery } from '@lobehub/market-sdk';

import { lambdaClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';
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

class DiscoverService {
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
    return lambdaClient.market.getAssistantList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
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

  getMcpIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getMcpIdentifiers.query();
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

  getMcpManifest = async (params: { identifier: string; locale?: string; version?: string }) => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getMcpManifest.query({
      ...params,
      locale,
    });
  };

  reportMcpInstallResult = async (params: {
    errorMessage?: string;
    identifier: string;
    installDurationMs?: number;
    manifest?: any;
    metadata?: any;
    platform?: string;
    success: boolean;
    userAgent?: string;
    version: string;
  }) => {
    return lambdaClient.market.reportMcpInstallResult.mutate(params);
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
}

export const discoverService = new DiscoverService();
