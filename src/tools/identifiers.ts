import { AgentBuilderManifest } from '@lobechat/builtin-tool-agent-builder';
import { GroupAgentBuilderManifest } from '@lobechat/builtin-tool-group-agent-builder';
import { GroupManagementManifest } from '@lobechat/builtin-tool-group-management';
import { GTDManifest } from '@lobechat/builtin-tool-gtd';
import { LocalSystemManifest } from '@lobechat/builtin-tool-local-system';
import { MemoryManifest } from '@lobechat/builtin-tool-memory';
import { NotebookManifest } from '@lobechat/builtin-tool-notebook';

import { ArtifactsManifest } from './artifacts';
import { CodeInterpreterManifest } from './code-interpreter';
import { KnowledgeBaseManifest } from './knowledge-base';
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
  GroupAgentBuilderManifest.identifier,
  GroupManagementManifest.identifier,
  GTDManifest.identifier,
  MemoryManifest.identifier,
  NotebookManifest.identifier,
];
