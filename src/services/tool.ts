import { PluginListResponse, PluginManifest } from '@lobehub/market-sdk';

import { edgeClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';
import { convertOpenAIManifestToLobeManifest, getToolManifest } from '@/utils/toolManifest';

class ToolService {
  getToolList = async (): Promise<any> => {
    const locale = globalHelpers.getCurrentLanguage();

    return edgeClient.market.getLegacyPluginList.query({ locale });
  };

  getMCPPluginList = async (props: { q?: string }): Promise<PluginListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();

    return edgeClient.market.getMcpList.query({ locale, ...props });
  };

  getMCPPluginManifest = async (
    identifier: string,
    options: { install?: boolean } = {},
  ): Promise<PluginManifest> => {
    const locale = globalHelpers.getCurrentLanguage();

    return edgeClient.market.getMcpManifest.query({
      identifier,
      install: options.install,
      locale,
    });
  };

  getToolManifest = getToolManifest;
  convertOpenAIManifestToLobeManifest = convertOpenAIManifestToLobeManifest;
}

export const toolService = new ToolService();
