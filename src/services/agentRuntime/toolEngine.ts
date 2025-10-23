import { WorkingModel } from '@lobechat/types';

import { getSearchConfig } from '@/helpers/getSearchConfig';
import { createToolsEngine } from '@/helpers/toolEngineering';
import { WebBrowsingManifest } from '@/tools/web-browsing';

export const createAgentToolsEngine = (workingModel: WorkingModel) =>
  createToolsEngine({
    // Add WebBrowsingManifest as default tool
    defaultToolIds: [WebBrowsingManifest.identifier],
    // Create search-aware enableChecker for this request
    enableChecker: ({ pluginId }) => {
      // For WebBrowsingManifest, apply search logic
      if (pluginId === WebBrowsingManifest.identifier) {
        const searchConfig = getSearchConfig(workingModel.model, workingModel.provider);
        return searchConfig.useApplicationBuiltinSearchTool;
      }

      // For all other plugins, enable by default
      return true;
    },
  });
