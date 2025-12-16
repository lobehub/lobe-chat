import { GroupManagementManifest } from '@lobechat/builtin-tool-group-management';
import { GTDManifest } from '@lobechat/builtin-tool-gtd';

import { AgentBuilderManifest } from './agent-builder';
import { ArtifactsManifest } from './artifacts';
import { CodeInterpreterManifest } from './code-interpreter';
import { KnowledgeBaseManifest } from './knowledge-base';
import { LocalSystemManifest } from './local-system';
import { PageAgentManifest } from './page-agent';
import { WebBrowsingManifest } from './web-browsing';

export const builtinToolIdentifiers: string[] = [
  AgentBuilderManifest.identifier,
  ArtifactsManifest.identifier,
  LocalSystemManifest.identifier,
  WebBrowsingManifest.identifier,
  KnowledgeBaseManifest.identifier,
  CodeInterpreterManifest.identifier,
  PageAgentManifest.identifier,
  GroupManagementManifest.identifier,
  GTDManifest.identifier,
];
