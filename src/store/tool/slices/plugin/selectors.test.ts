import { describe, expect, it } from 'vitest';

import { ToolStoreState } from '../../initialState';
import { pluginSelectors } from './selectors';

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
  describe('enabledSchema', () => {
    it('enabledSchema should return correct ChatCompletionFunctions array', () => {
      const result = pluginSelectors.enabledSchema(['plugin-1'])(mockState);
      expect(result).toEqual([{ name: 'plugin-1____api-1____default' }]);
    });
    it('enabledSchema should return empty', () => {
      const result = pluginSelectors.enabledSchema([])(mockState);
      expect(result).toEqual([]);
    });
  });

  describe('getPluginManifestById', () => {
    it('getPluginManifestById should return the correct manifest', () => {
      const result = pluginSelectors.getPluginManifestById('plugin-1')(mockState);
      expect(result).toEqual(mockState.pluginManifestMap['plugin-1']);
    });
  });

  describe('pluginList', () => {
    it('should return the combined list of pluginList and customPluginList', () => {
      const result = pluginSelectors.pluginList(mockState);
      expect(result).toEqual([...mockState.pluginList, ...mockState.customPluginList]);
    });
  });

  describe('getPluginMetaById', () => {
    it('should return the plugin metadata by id', () => {
      const result = pluginSelectors.getPluginMetaById('plugin-1')(mockState);
      expect(result).toEqual(mockState.pluginList[0]);
    });
  });

  describe('getDevPluginById', () => {
    it('should return undefined for non-existing custom plugin', () => {
      const result = pluginSelectors.getDevPluginById('non-existing')(mockState);
      expect(result).toBeUndefined();
    });

    it('should return custom plugin by id if exists', () => {
      const customPlugin = {
        identifier: 'custom-plugin',
        author: 'Custom Author',
        createAt: '2023-03-03',
        meta: { avatar: 'avatar-url-custom', title: 'Custom Plugin' },
        homepage: 'http://homepage-custom.com',
      };
      const stateWithCustomPlugin = {
        ...mockState,
        customPluginList: [customPlugin],
      } as ToolStoreState;
      const result = pluginSelectors.getDevPluginById('custom-plugin')(stateWithCustomPlugin);
      expect(result).toEqual(customPlugin);
    });
  });

  describe('getPluginSettingsById', () => {
    it('should return the plugin settings by id', () => {
      const mockSettings = { setting1: 'value1' };
      const stateWithSettings = {
        ...mockState,
        pluginsSettings: { 'plugin-1': mockSettings },
      };
      const result = pluginSelectors.getPluginSettingsById('plugin-1')(stateWithSettings);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('displayPluginList', () => {
    it('should return a list of plugins with display information', () => {
      const result = pluginSelectors.displayPluginList(mockState);
      const expected = mockState.pluginList.map((p) => ({
        author: p.author,
        avatar: p.meta?.avatar,
        createAt: p.createAt,
        desc: p.meta.description,
        homepage: p.homepage,
        identifier: p.identifier,
        title: p.meta.title,
      }));
      expect(result).toEqual(expected);
    });
  });

  describe('hasPluginUI', () => {
    it('should return false when the plugin does not have a UI component', () => {
      const result = pluginSelectors.hasPluginUI('non-ui-plugin')(mockState);
      expect(result).toBe(false);
    });

    it('should return true when the plugin has a UI component', () => {
      const stateWithUIPlugin = {
        ...mockState,
        pluginManifestMap: {
          ...mockState.pluginManifestMap,
          'ui-plugin': {
            ...mockState.pluginManifestMap['plugin-1'],
            ui: true,
          },
        },
      } as unknown as ToolStoreState;
      const result = pluginSelectors.hasPluginUI('ui-plugin')(stateWithUIPlugin);
      expect(result).toBe(true);
    });
  });
});
