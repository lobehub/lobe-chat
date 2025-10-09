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

const followUpManifest = {
  api: [],
  identifier: addToFollowUpTool.name,
  meta: { description: addToFollowUpTool.description },
  systemRole: 'follow_up',
  type: 'builtin',
};
const dontFollowUpManifest = {
  api: [],
  identifier: addToDontFollowUpTool.name,
  meta: { description: addToDontFollowUpTool.description },
  systemRole: 'dont_follow_up',
  type: 'builtin',
};
const keepWarmManifest = {
  api: [],
  identifier: addToKeepWarmTool.name,
  meta: { description: addToKeepWarmTool.description },
  systemRole: 'keep_warm',
  type: 'builtin',
};

export const customTools = [
  {
    identifier: followUpManifest.identifier,
    manifest: followUpManifest,
    type: 'builtin',
  },
  {
    identifier: dontFollowUpManifest.identifier,
    manifest: dontFollowUpManifest,
    type: 'builtin',
  },
  {
    identifier: keepWarmManifest.identifier,
    manifest: keepWarmManifest,
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
