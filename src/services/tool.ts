import { PluginListResponse, PluginManifest } from '@lobehub/market-sdk';

import { edgeClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';
import { DiscoverPlugintem } from '@/types/discover';
import { convertOpenAIManifestToLobeManifest, getToolManifest } from '@/utils/toolManifest';

class ToolService {
  getToolList = async (): Promise<DiscoverPlugintem[]> => {
    const locale = globalHelpers.getCurrentLanguage();

    return edgeClient.market.getLegacyPluginList.query({ locale });
  };

  getMCPPluginList = async (props: { q?: string }): Promise<PluginListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();

    return edgeClient.market.getPluginList.query({ locale, ...props });
  };

  getMCPPluginManifest = async (
    identifier: string,
    options: { install?: boolean } = {},
  ): Promise<PluginManifest> => {
    const locale = globalHelpers.getCurrentLanguage();

    return edgeClient.market.getPluginManifest.query({
      identifier,
      install: options.install,
      locale,
    });
  };

  getToolManifest = getToolManifest;
  convertOpenAIManifestToLobeManifest = convertOpenAIManifestToLobeManifest;
}

export const toolService = new ToolService();
