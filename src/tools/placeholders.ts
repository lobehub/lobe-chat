import { BuiltinPlaceholder } from '@lobechat/types';

import { LocalSystemApiName, LocalSystemManifest } from './local-system';
import { ListFiles as LocalSystemListFiles } from './local-system/Placeholder/ListFiles';
import LocalSystemSearchFiles from './local-system/Placeholder/SearchFiles';
import { WebBrowsingApiName, WebBrowsingManifest } from './web-browsing';
import CrawlMultiPages from './web-browsing/Placeholder/CrawlMultiPages';
import CrawlSinglePage from './web-browsing/Placeholder/CrawlSinglePage';
import { Search } from './web-browsing/Placeholder/Search';

/**
 * Builtin tools placeholders registry
 * Organized by toolset (identifier) -> API name
 */
export const BuiltinToolPlaceholders: Record<string, Record<string, any>> = {
  [LocalSystemManifest.identifier]: {
    [LocalSystemApiName.searchLocalFiles]: LocalSystemSearchFiles,
    [LocalSystemApiName.listLocalFiles]: LocalSystemListFiles,
  },
  [WebBrowsingManifest.identifier]: {
    [WebBrowsingApiName.search]: Search,
    [WebBrowsingApiName.crawlSinglePage]: CrawlSinglePage,
    [WebBrowsingApiName.crawlMultiPages]: CrawlMultiPages,
  },
};

/**
 * Get builtin placeholder component for a specific API
 * @param identifier - Tool identifier (e.g., 'lobe-local-system')
 * @param apiName - API name (e.g., 'searchLocalFiles')
 */
export const getBuiltinPlaceholder = (
  identifier?: string,
  apiName?: string,
): BuiltinPlaceholder | undefined => {
  if (!identifier || !apiName) return undefined;

  const toolset = BuiltinToolPlaceholders[identifier];
  if (!toolset) return undefined;

  return toolset[apiName];
};
