import { DalleManifest } from '@/tools/dalle';
import { LobeToolMeta } from '@/types/tool/tool';

import type { ToolStoreState } from '../../initialState';

const metaList =
  (showDalle?: boolean) =>
  (s: ToolStoreState): LobeToolMeta[] =>
    s.builtinTools
      .filter(
        (item) =>
          !item.hidden && (!showDalle ? item.identifier !== DalleManifest.identifier : true),
      )
      .map((t) => ({
        author: 'LobeHub',
        identifier: t.identifier,
        meta: t.manifest.meta,
        source: 'builtin',
        type: 'builtin',
      }));

export const builtinToolSelectors = {
  metaList,
};
