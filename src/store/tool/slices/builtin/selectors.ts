import { ImageGeneratorManifest } from '@/tools/image-generator';
import { LobeToolMeta } from '@/types/tool/tool';

import type { ToolStoreState } from '../../initialState';

const metaList =
  (showDalle?: boolean) =>
  (s: ToolStoreState): LobeToolMeta[] =>
    s.builtinTools
      .filter(
        (item) =>
          !item.hidden && (!showDalle ? item.identifier !== ImageGeneratorManifest.identifier : true),
      )
      .map((t) => ({
        author: 'Imoogle',
        identifier: t.identifier,
        meta: t.manifest.meta,
        type: 'builtin',
      }));

export const builtinToolSelectors = {
  metaList,
};
