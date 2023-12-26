import { LobeChatPluginManifest, LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { describe, expect, it } from 'vitest';

import { initialState } from '../initialState';
import { ToolStoreState } from '../initialState';
import { toolSelectors } from './tool';

const mockState = {
  ...initialState,
  pluginInstallLoading: {
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
      },
      type: 'plugin',
    },
    {
      identifier: 'plugin-3',
      manifest: {
        identifier: 'plugin-3',
        api: [{ name: 'api-3' }],
      },
      type: 'customPlugin',
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

describe('toolSelectors', () => {
  describe('enabledSchema', () => {
    it('enabledSchema should return correct ChatCompletionFunctions array', () => {
      const result = toolSelectors.enabledSchema(['plugin-1', 'plugin-2'])(mockState);
      expect(result).toEqual([
        {
          type: 'function',
          function: {
            name: 'plugin-1____api-1',
          },
        },
        {
          type: 'function',
          function: {
            name: 'plugin-2____api-2',
          },
        },
      ]);
    });

    it('enabledSchema should return with standalone plugin', () => {
      const result = toolSelectors.enabledSchema(['plugin-4'])({
        ...mockState,
        installedPlugins: [
          ...mockState.installedPlugins,
          {
            identifier: 'plugin-4',
            manifest: {
              identifier: 'plugin-4',
              api: [{ name: 'api-4' }],
              type: 'standalone',
            },
            type: 'plugin',
          },
        ],
      } as ToolStoreState);
      expect(result).toEqual([
        {
          type: 'function',
          function: {
            name: 'plugin-4____api-4____standalone',
          },
        },
      ]);
    });

    it('enabledSchema should return md5 hash apiName', () => {
      const result = toolSelectors.enabledSchema(['long-long-plugin-with-id'])({
        ...mockState,
        installedPlugins: [
          ...mockState.installedPlugins,
          {
            identifier: 'long-long-plugin-with-id',
            manifest: {
              identifier: 'long-long-plugin-with-id',
              api: [{ name: 'long-long-manifest-long-long-apiName' }],
            },
            type: 'plugin',
          },
        ],
      } as ToolStoreState);
      expect(result).toEqual([
        {
          type: 'function',
          function: {
            name: 'long-long-plugin-with-id____MD5HASH_396eae4c671da3fb642c49ad2b9e8790',
          },
        },
      ]);
    });

    it('enabledSchema should return empty', () => {
      const result = toolSelectors.enabledSchema([])(mockState);
      expect(result).toEqual([]);
    });
  });

  describe('getPluginManifestLoadingStatus', () => {
    it('should return "loading" if the plugin manifest is being loaded', () => {
      const result = toolSelectors.getManifestLoadingStatus('plugin-2')(mockState);
      expect(result).toBe('loading');
    });

    it('should return "error" if the plugin manifest is not found', () => {
      const result = toolSelectors.getManifestLoadingStatus('non-existing-plugin')(mockState);
      expect(result).toBe('error');
    });

    it('should return "success" if the plugin manifest is loaded', () => {
      const result = toolSelectors.getManifestLoadingStatus('plugin-1')(mockState);
      expect(result).toBe('success');
    });
  });
});
