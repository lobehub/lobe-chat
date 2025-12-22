// agent-builder
import { AgentBuilderManifest } from '@lobechat/builtin-tool-agent-builder';
import { AgentBuilderRenders } from '@lobechat/builtin-tool-agent-builder/client';
// group-management
import { GroupManagementManifest } from '@lobechat/builtin-tool-group-management';
import { GroupManagementRenders } from '@lobechat/builtin-tool-group-management/client';
// gtd
import { GTDManifest, GTDRenders } from '@lobechat/builtin-tool-gtd/client';
// local-system
import { LocalSystemManifest } from '@lobechat/builtin-tool-local-system';
import { NotebookManifest, NotebookRenders } from '@lobechat/builtin-tool-notebook/client';
import { BuiltinRender } from '@lobechat/types';

// code-interpreter
import { CodeInterpreterManifest } from './code-interpreter';
import { CodeInterpreterRenders } from './code-interpreter/Render';
// knowledge-base
import { KnowledgeBaseManifest } from './knowledge-base';
import { KnowledgeBaseRenders } from './knowledge-base/Render';
import { LocalSystemRenders } from './local-system/Render';
// web-browsing
import { WebBrowsingManifest } from './web-browsing';
import { WebBrowsingRenders } from './web-browsing/Render';

/**
 * Builtin tools renders registry
 * Organized by toolset (identifier) -> API name
 */
const BuiltinToolsRenders: Record<string, Record<string, BuiltinRender>> = {
  [AgentBuilderManifest.identifier]: AgentBuilderRenders as Record<string, BuiltinRender>,
  [CodeInterpreterManifest.identifier]: CodeInterpreterRenders as Record<string, BuiltinRender>,
  [GroupManagementManifest.identifier]: GroupManagementRenders as Record<string, BuiltinRender>,
  [GTDManifest.identifier]: GTDRenders as Record<string, BuiltinRender>,
  [NotebookManifest.identifier]: NotebookRenders as Record<string, BuiltinRender>,
  [KnowledgeBaseManifest.identifier]: KnowledgeBaseRenders as Record<string, BuiltinRender>,
  [LocalSystemManifest.identifier]: LocalSystemRenders as Record<string, BuiltinRender>,
  [WebBrowsingManifest.identifier]: WebBrowsingRenders as Record<string, BuiltinRender>,
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
