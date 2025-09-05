import { describe, expect, it } from 'vitest';

import { ImageGeneratorManifest } from '@/tools/image-generator';

import { ToolStoreState, initialState } from '../../initialState';
import { builtinToolSelectors } from './selectors';

describe('builtinToolSelectors', () => {
  describe('metaList', () => {
    it('should return meta list excluding Dalle when showDalle is false', () => {
      const state = {
        ...initialState,
        builtinTools: [
          { identifier: 'tool-1', manifest: { meta: { title: 'Tool 1' } } },
          { identifier: ImageGeneratorManifest.identifier, manifest: { meta: { title: 'Image Generator' } } },
        ],
      } as ToolStoreState;
      const result = builtinToolSelectors.metaList(false)(state);
      expect(result).toEqual([
        { author: 'Imoogle', identifier: 'tool-1', meta: { title: 'Tool 1' }, type: 'builtin' },
      ]);
    });

    it('should include Dalle when showDalle is true', () => {
      const state = {
        ...initialState,
        builtinTools: [
          { identifier: 'tool-1', manifest: { meta: { title: 'Tool 1' } } },
          { identifier: ImageGeneratorManifest.identifier, manifest: { meta: { title: 'Image Generator' } } },
        ],
      } as ToolStoreState;
      const result = builtinToolSelectors.metaList(true)(state);
      expect(result).toEqual([
        { author: 'Imoogle', identifier: 'tool-1', meta: { title: 'Tool 1' }, type: 'builtin' },
        {
          author: 'Imoogle',
          identifier: ImageGeneratorManifest.identifier,
          meta: { title: 'Image Generator' },
          type: 'builtin',
        },
      ]);
    });

    it('should hide tool when not need visible with hidden', () => {
      const state = {
        ...initialState,
        builtinTools: [
          { identifier: 'tool-1', hidden: true, manifest: { meta: { title: 'Tool 1' } } },
          { identifier: ImageGeneratorManifest.identifier, manifest: { meta: { title: 'Image Generator' } } },
        ],
      } as ToolStoreState;
      const result = builtinToolSelectors.metaList(false)(state);
      expect(result).toEqual([]);
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
