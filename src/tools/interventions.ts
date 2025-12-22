import {
  AgentBuilderInterventions,
  AgentBuilderManifest,
} from '@lobechat/builtin-tool-agent-builder/client';
import {
  GroupManagementInterventions,
  GroupManagementManifest,
} from '@lobechat/builtin-tool-group-management/client';
import { GTDInterventions, GTDManifest } from '@lobechat/builtin-tool-gtd/client';
import { LocalSystemManifest } from '@lobechat/builtin-tool-local-system';
import { NotebookManifest } from '@lobechat/builtin-tool-notebook';
import { NotebookInterventions } from '@lobechat/builtin-tool-notebook/client';
import { BuiltinIntervention } from '@lobechat/types';

import { CodeInterpreterManifest as CloudCodeInterpreterManifest } from './code-interpreter';
import { CodeInterpreterInterventions } from './code-interpreter/Intervention';
import { LocalSystemInterventions } from './local-system/Intervention';

/**
 * Builtin tools interventions registry
 * Organized by toolset (identifier) -> API name
 * Only register APIs that have custom intervention UI
 */
export const BuiltinToolInterventions: Record<string, Record<string, any>> = {
  [AgentBuilderManifest.identifier]: AgentBuilderInterventions,
  [CloudCodeInterpreterManifest.identifier]: CodeInterpreterInterventions,
  [GroupManagementManifest.identifier]: GroupManagementInterventions,
  [GTDManifest.identifier]: GTDInterventions,
  [LocalSystemManifest.identifier]: LocalSystemInterventions,
  [NotebookManifest.identifier]: NotebookInterventions,
};

/**
 * Get builtin intervention component for a specific API
 * @param identifier - Tool identifier (e.g., 'lobe-local-system')
 * @param apiName - API name (e.g., 'runCommand')
 */
export const getBuiltinIntervention = (
  identifier?: string,
  apiName?: string,
): BuiltinIntervention | undefined => {
  if (!identifier || !apiName) return undefined;

  const toolset = BuiltinToolInterventions[identifier];
  if (!toolset) return undefined;

  return toolset[apiName];
};
