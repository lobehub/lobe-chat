import { LobeToolMeta } from '@lobechat/types';

import { shouldEnableTool } from '@/helpers/toolFilters';

import type { ToolStoreState } from '../../initialState';

const metaList = (s: ToolStoreState): LobeToolMeta[] =>
  s.builtinTools
    .filter((item) => {
      // Filter hidden tools
      if (item.hidden) return false;

      // Filter platform-specific tools (e.g., LocalSystem desktop-only)
      if (!shouldEnableTool(item.identifier)) return false;

      return true;
    })
    .map((t) => ({
      author: 'LobeHub',
      identifier: t.identifier,
      meta: t.manifest.meta,
      type: 'builtin',
    }));

export const builtinToolSelectors = {
  metaList,
};
