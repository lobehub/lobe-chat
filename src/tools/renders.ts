import { BuiltinRender } from '@lobechat/types';

import { CodeInterpreterManifest } from './code-interpreter';
import CodeInterpreterRender from './code-interpreter/Render';
// knowledge-base
import { KnowledgeBaseManifest } from './knowledge-base';
import { KnowledgeBaseRenders } from './knowledge-base/Render';
// local-system
import { LocalSystemManifest } from './local-system';
import { LocalSystemRenders } from './local-system/Render';
// web-browsing
import { WebBrowsingManifest } from './web-browsing';
import { WebBrowsingRenders } from './web-browsing/Render';

/**
 * Builtin tools renders registry
 * Organized by toolset (identifier) -> API name
 */
const BuiltinToolsRenders: Record<string, Record<string, BuiltinRender>> = {
  [LocalSystemManifest.identifier]: LocalSystemRenders as Record<string, BuiltinRender>,
  [WebBrowsingManifest.identifier]: WebBrowsingRenders as Record<string, BuiltinRender>,
  [KnowledgeBaseManifest.identifier]: KnowledgeBaseRenders as Record<string, BuiltinRender>,
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
