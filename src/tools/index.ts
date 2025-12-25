import { AgentBuilderManifest } from '@lobechat/builtin-tool-agent-builder';
import { GroupAgentBuilderManifest } from '@lobechat/builtin-tool-group-agent-builder';
import { GroupManagementManifest } from '@lobechat/builtin-tool-group-management';
import { GTDManifest } from '@lobechat/builtin-tool-gtd';
import { LocalSystemManifest } from '@lobechat/builtin-tool-local-system';
import { MemoryManifest } from '@lobechat/builtin-tool-memory';
import { NotebookManifest } from '@lobechat/builtin-tool-notebook';
import { PageAgentManifest } from '@lobechat/builtin-tool-page-agent';
import { LobeBuiltinTool } from '@lobechat/types';

import { isDesktop } from '@/const/version';

import { ArtifactsManifest } from './artifacts';
import { CodeInterpreterManifest } from './code-interpreter';
import { KnowledgeBaseManifest } from './knowledge-base';
import { WebBrowsingManifest } from './web-browsing';

export const builtinTools: LobeBuiltinTool[] = [
  {
    identifier: ArtifactsManifest.identifier,
    manifest: ArtifactsManifest,
    type: 'builtin',
  },
  {
    hidden: !isDesktop,
    identifier: LocalSystemManifest.identifier,
    manifest: LocalSystemManifest,
    type: 'builtin',
  },
  {
    identifier: MemoryManifest.identifier,
    manifest: MemoryManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: WebBrowsingManifest.identifier,
    manifest: WebBrowsingManifest,
    type: 'builtin',
  },
  {
    identifier: CodeInterpreterManifest.identifier,
    manifest: CodeInterpreterManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: KnowledgeBaseManifest.identifier,
    manifest: KnowledgeBaseManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: PageAgentManifest.identifier,
    manifest: PageAgentManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: AgentBuilderManifest.identifier,
    manifest: AgentBuilderManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: GroupAgentBuilderManifest.identifier,
    manifest: GroupAgentBuilderManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: GroupManagementManifest.identifier,
    manifest: GroupManagementManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: GTDManifest.identifier,
    manifest: GTDManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: NotebookManifest.identifier,
    manifest: NotebookManifest,
    type: 'builtin',
  },
];
