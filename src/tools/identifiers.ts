import { AgentBuilderManifest } from './agent-builder';
import { ArtifactsManifest } from './artifacts';
import { CodeInterpreterManifest } from './code-interpreter';
import { DocumentManifest } from './document';
import { KnowledgeBaseManifest } from './knowledge-base';
import { LocalSystemManifest } from './local-system';
import { WebBrowsingManifest } from './web-browsing';

export const builtinToolIdentifiers: string[] = [
  AgentBuilderManifest.identifier,
  ArtifactsManifest.identifier,
  LocalSystemManifest.identifier,
  WebBrowsingManifest.identifier,
  KnowledgeBaseManifest.identifier,
  CodeInterpreterManifest.identifier,
  DocumentManifest.identifier,
];
