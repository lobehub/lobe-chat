import { describe, expect, it } from 'vitest';

import { ToolStoreState } from '../../initialState';
import { customPluginSelectors } from './selectors';

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
  customPluginList: [],
  pluginsSettings: {},
} as unknown as ToolStoreState;

describe('pluginSelectors', () => {
  describe('isCustomPlugin', () => {
    it('should return false for a non-custom plugin', () => {
      const result = customPluginSelectors.isCustomPlugin('plugin-1')(mockState);
      expect(result).toBe(false);
    });

    it('should return true for a custom plugin', () => {
      const stateWithCustomPlugin = {
        ...mockState,
        customPluginList: [{ identifier: 'custom-plugin' }],
      } as ToolStoreState;
      const result = customPluginSelectors.isCustomPlugin('custom-plugin')(stateWithCustomPlugin);
      expect(result).toBe(true);
    });
  });
});
