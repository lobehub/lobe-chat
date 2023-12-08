import { LobeChatPluginManifest, LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { describe, expect, it } from 'vitest';

import { initialState } from '../../initialState';
import { ToolStoreState } from '../../initialState';
import { pluginSelectors } from './selectors';

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
      settings: { setting1: 'value1' },
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
      expect(result).toEqual(mockState.installedPlugins[0].manifest);
    });
  });

  describe('getPluginMetaById', () => {
    it('should return the plugin metadata by id', () => {
      const result = pluginSelectors.getPluginMetaById('plugin-1')(mockState);
      expect(result).toEqual(mockState.pluginStoreList[0].meta);
    });
  });

  describe('getDevPluginById', () => {
    it('should return undefined for non-existing custom plugin', () => {
      const result = pluginSelectors.getCustomPluginById('non-existing')(mockState);
      expect(result).toBeUndefined();
    });

    it('should return custom plugin by id if exists', () => {
      const customPlugin = {
        type: 'customPlugin',
        identifier: 'custom-plugin',
        manifest: {
          identifier: 'custom-plugin',
          author: 'Custom Author',
          createAt: '2023-03-03',
          meta: { avatar: 'avatar-url-custom', title: 'Custom Plugin' },
          homepage: 'http://homepage-custom.com',
        },
      };

      const stateWithCustomPlugin = {
        ...mockState,
        installedPlugins: [...mockState.installedPlugins, customPlugin],
      } as ToolStoreState;
      const result = pluginSelectors.getCustomPluginById('custom-plugin')(stateWithCustomPlugin);
      expect(result).toEqual(customPlugin);
    });
  });

  describe('getPluginSettingsById', () => {
    it('should return the plugin settings by id', () => {
      const mockSettings = { setting1: 'value1' };

      const result = pluginSelectors.getPluginSettingsById('plugin-1')(mockState);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('hasPluginUI', () => {
    it('should return false when the plugin does not have a UI component', () => {
      const result = pluginSelectors.isPluginHasUI('non-ui-plugin')(mockState);
      expect(result).toBe(false);
    });

    it('should return true when the plugin has a UI component', () => {
      const stateWithUIPlugin = {
        ...mockState,
        installedPlugins: [
          ...mockState.installedPlugins,
          {
            ...mockState.installedPlugins[0],
            identifier: 'ui-plugin',
            manifest: {
              ...mockState.installedPlugins[0].manifest,
              identifier: 'ui-plugin',
              ui: true,
            },
          },
        ],
      } as ToolStoreState;
      const result = pluginSelectors.isPluginHasUI('ui-plugin')(stateWithUIPlugin);
      expect(result).toBe(true);
    });
  });
});
