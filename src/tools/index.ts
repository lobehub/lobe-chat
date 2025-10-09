import { isDesktop } from '@/const/version';
import { LobeBuiltinTool } from '@/types/tool';

import { ArtifactsManifest } from './artifacts';
import { CodeInterpreterManifest } from './code-interpreter';
import { DalleManifest } from './dalle';
import { LocalSystemManifest } from './local-system';
import { WebBrowsingManifest } from './web-browsing';
import { addToFollowUpTool } from './follow-up/addToFollowUp';
import { addToDontFollowUpTool } from './follow-up/addToDontFollowUp';
import { addToKeepWarmTool } from './follow-up/addToKeepWarm';

export const customTools = [
  {
    identifier: addToFollowUpTool.name,
    manifest: addToFollowUpTool,
    type: 'builtin',
  },
  {
    identifier: addToDontFollowUpTool.name,
    manifest: addToDontFollowUpTool,
    type: 'builtin',
  },
  {
    identifier: addToKeepWarmTool.name,
    manifest: addToKeepWarmTool,
    type: 'builtin',
  },
];

export const builtinTools: LobeBuiltinTool[] = [
  ...customTools,
  {
    identifier: ArtifactsManifest.identifier,
    manifest: ArtifactsManifest,
    type: 'builtin',
  },
  {
    identifier: DalleManifest.identifier,
    manifest: DalleManifest,
    type: 'builtin',
  },
  {
    hidden: !isDesktop,
    identifier: LocalSystemManifest.identifier,
    manifest: LocalSystemManifest,
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
];
