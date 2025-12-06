import { LobeBuiltinTool } from '@lobechat/types';

import { isDesktop } from '@/const/version';

import { AgentBuilderManifest } from './agent-builder';
import { ArtifactsManifest } from './artifacts';
import { CodeInterpreterManifest } from './code-interpreter';
import { DocumentManifest } from './document';
import { KnowledgeBaseManifest } from './knowledge-base';
import { LocalSystemManifest } from './local-system';
import { MemoryManifest } from './memory';
import { WebBrowsingManifest } from './web-browsing';

export const builtinTools: LobeBuiltinTool[] = [
  // TODO: Migrate to the extended plugin system to configure different context engineering combinations.
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
    identifier: DocumentManifest.identifier,
    manifest: DocumentManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: AgentBuilderManifest.identifier,
    manifest: AgentBuilderManifest,
    type: 'builtin',
  },
];
