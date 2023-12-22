import { LobeBuiltinTool } from '@/types/tool';

import { DalleManifest } from './dalle';

export const builtinTools: LobeBuiltinTool[] = [
  {
    identifier: 'dalle3',
    manifest: DalleManifest,
    type: 'builtin',
  },
];
