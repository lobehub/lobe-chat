import { BuiltinRender } from '@lobechat/types';

import { CodeInterpreterManifest } from './code-interpreter';
import CodeInterpreterRender from './code-interpreter/Render';
// local-system
import { LocalSystemApiName, LocalSystemManifest } from './local-system';
import ListFiles from './local-system/Render/ListFiles';
import ReadLocalFile from './local-system/Render/ReadLocalFile';
import RenameLocalFile from './local-system/Render/RenameLocalFile';
import RunCommand from './local-system/Render/RunCommand';
import SearchFiles from './local-system/Render/SearchFiles';
import WriteFile from './local-system/Render/WriteFile';
// web-browsing
import { WebBrowsingApiName, WebBrowsingManifest } from './web-browsing';
import CrawlMultiPages from './web-browsing/Render/CrawlMultiPages';
import CrawlSinglePage from './web-browsing/Render/CrawlSinglePage';
import Search from './web-browsing/Render/Search';

/**
 * Builtin tools renders registry
 * Organized by toolset (identifier) -> API name
 */
const BuiltinToolsRenders: Record<string, Record<string, BuiltinRender>> = {
  [LocalSystemManifest.identifier]: {
    [LocalSystemApiName.searchLocalFiles]: SearchFiles as BuiltinRender,
    [LocalSystemApiName.listLocalFiles]: ListFiles as BuiltinRender,
    [LocalSystemApiName.readLocalFile]: ReadLocalFile as BuiltinRender,
    [LocalSystemApiName.renameLocalFile]: RenameLocalFile as BuiltinRender,
    [LocalSystemApiName.writeLocalFile]: WriteFile as BuiltinRender,
    [LocalSystemApiName.runCommand]: RunCommand as BuiltinRender,
  },
  [WebBrowsingManifest.identifier]: {
    [WebBrowsingApiName.search]: Search as BuiltinRender,
    [WebBrowsingApiName.crawlSinglePage]: CrawlSinglePage as BuiltinRender,
    [WebBrowsingApiName.crawlMultiPages]: CrawlMultiPages as BuiltinRender,
  },
  [CodeInterpreterManifest.identifier]: {
    python: CodeInterpreterRender as BuiltinRender,
  },
};

/**
 * Get builtin render component for a specific API
 * @param identifier - Tool identifier (e.g., 'lobe-local-system')
 * @param apiName - API name (e.g., 'searchLocalFiles')
 */
export const getBuiltinRender = (
  identifier?: string,
  apiName?: string,
): BuiltinRender | undefined => {
  if (!identifier) return undefined;

  const toolset = BuiltinToolsRenders[identifier];
  if (!toolset) return undefined;

  if (apiName && toolset[apiName]) {
    return toolset[apiName];
  }

  return undefined;
};
