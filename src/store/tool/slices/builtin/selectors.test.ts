import { describe, expect, it } from 'vitest';

import { DalleManifest } from '@/tools/dalle';

import { ToolStoreState, initialState } from '../../initialState';
import { builtinToolSelectors } from './selectors';

describe('builtinToolSelectors', () => {
  describe('metaList', () => {
    it('should return meta list excluding Dalle when showDalle is false', () => {
      const state = {
        ...initialState,
        builtinTools: [
          { identifier: 'tool-1', manifest: { meta: { title: 'Tool 1' } } },
          { identifier: DalleManifest.identifier, manifest: { meta: { title: 'Dalle' } } },
        ],
      } as ToolStoreState;
      const result = builtinToolSelectors.metaList(false)(state);
      expect(result).toEqual([
        { author: 'LobeHub', identifier: 'tool-1', meta: { title: 'Tool 1' }, type: 'builtin' },
      ]);
    });

    it('should include Dalle when showDalle is true', () => {
      const state = {
        ...initialState,
        builtinTools: [
          { identifier: 'tool-1', manifest: { meta: { title: 'Tool 1' } } },
          { identifier: DalleManifest.identifier, manifest: { meta: { title: 'Dalle' } } },
        ],
      } as ToolStoreState;
      const result = builtinToolSelectors.metaList(true)(state);
      expect(result).toEqual([
        { author: 'LobeHub', identifier: 'tool-1', meta: { title: 'Tool 1' }, type: 'builtin' },
        {
          author: 'LobeHub',
          identifier: DalleManifest.identifier,
          meta: { title: 'Dalle' },
          type: 'builtin',
        },
      ]);
    });

    it('should return an empty list if no builtin tools are available', () => {
      const state: ToolStoreState = {
        ...initialState,
        builtinTools: [],
      };
      const result = builtinToolSelectors.metaList(false)(state);
      expect(result).toEqual([]);
    });
  });
});
