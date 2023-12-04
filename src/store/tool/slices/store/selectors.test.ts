import { describe, expect, it } from 'vitest';

import { ToolStoreState } from '../../initialState';
import { pluginStoreSelectors } from './selectors';

const mockState = {
  pluginManifestMap: {
    'plugin-1': {
      identifier: 'plugin-1',
      api: [{ name: 'api-1' }],
      type: 'default',
    },
    'plugin-2': {
      identifier: 'plugin-2',
      api: [{ name: 'api-2' }],
      type: 'default',
    },
  },
  pluginManifestLoading: {
    'plugin-1': false,
    'plugin-2': true,
  },
  pluginList: [
    {
      identifier: 'plugin-1',
      author: 'Author 1',
      createAt: '2021-01-01',
      meta: { avatar: 'avatar-url-1', title: 'Plugin 1' },
      homepage: 'http://homepage-1.com',
    },
    {
      identifier: 'plugin-2',
      author: 'Author 2',
      createAt: '2022-02-02',
      meta: { avatar: 'avatar-url-2', title: 'Plugin 2' },
      homepage: 'http://homepage-2.com',
    },
  ],
} as unknown as ToolStoreState;

describe('pluginStoreSelectors', () => {
  describe('onlinePluginStore', () => {
    it('should return the online plugin list', () => {
      const result = pluginStoreSelectors.onlinePluginStore(mockState);
      expect(result).toEqual(mockState.pluginList);
    });
  });
});
