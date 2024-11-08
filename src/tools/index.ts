import { LobeBuiltinTool } from '@/types/tool';

import { ArtifactsManifest } from './artifacts';
import { DalleManifest } from './dalle';

export const builtinTools: LobeBuiltinTool[] = [
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
];
