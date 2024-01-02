import { LobeBuiltinTool } from '@/types/tool';

import { DalleManifest } from './dalle';

export const builtinTools: LobeBuiltinTool[] = [
  {
    identifier: DalleManifest.identifier,
    manifest: DalleManifest,
    type: 'builtin',
  },
];
