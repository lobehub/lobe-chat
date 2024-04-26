import { LobeChatPluginManifest, LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { describe, expect, it } from 'vitest';

import { DalleManifest } from '@/tools/dalle';

import { ToolStoreState, initialState } from '../../initialState';
import { builtinToolSelectors } from './selectors';

const mockState = {
  ...initialState,
  pluginManifestLoading: {
    'plugin-1': false,
    'plugin-2': true,
  },
  installedPlugins: [
    {
      identifier: 'plugin-1',
      type: 'plugin',
      manifest: {
        identifier: 'plugin-1',
        api: [{ name: 'api-1' }],
        type: 'default',
      } as LobeChatPluginManifest,
    },
    {
      identifier: 'plugin-2',
      manifest: {
        identifier: 'plugin-2',
        api: [{ name: 'api-2' }],
        type: 'default',
      },
      type: 'plugin',
    },
  ],
  pluginStoreList: [
    {
      identifier: 'plugin-1',
      author: 'Author 1',
      createdAt: '2021-01-01',
      meta: { avatar: 'avatar-url-1', title: 'Plugin 1' },
      homepage: 'http://homepage-1.com',
    } as LobeChatPluginMeta,
    {
      identifier: 'plugin-2',
      author: 'Author 2',
      createdAt: '2022-02-02',
      meta: { avatar: 'avatar-url-2', title: 'Plugin 2' },
      homepage: 'http://homepage-2.com',
    },
  ],
} as ToolStoreState;

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
