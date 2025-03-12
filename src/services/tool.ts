import { globalHelpers } from '@/store/global/helpers';
import { DiscoverPlugintem } from '@/types/discover';
import { convertOpenAIManifestToLobeManifest, getToolManifest } from '@/utils/toolManifest';

import { API_ENDPOINTS } from './_url';

class ToolService {
  getToolList = async (): Promise<DiscoverPlugintem[]> => {
    const locale = globalHelpers.getCurrentLanguage();

    const res = await fetch(`${API_ENDPOINTS.pluginStore}?locale=${locale}`);

    const json = await res.json();

    return json.plugins;
  };

  getToolManifest = getToolManifest;
  convertOpenAIManifestToLobeManifest = convertOpenAIManifestToLobeManifest;
}

export const toolService = new ToolService();
