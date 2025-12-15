import { AgentBuilderManifest } from './agent-builder';
import { ArtifactsManifest } from './artifacts';
import { CodeInterpreterManifest as CloudCodeInterpreterManifest } from './code-interpreter';
import { CodeInterpreterManifest } from './code-interpreter-draft';
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
  CloudCodeInterpreterManifest.identifier,
  PageAgentManifest.identifier,
];
