import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { describe, expect, it, vi } from 'vitest';

import { generateTools } from './toolEngineering';

// Mock the store and helper dependencies
vi.mock('@/store/tool', () => ({
  getToolStoreState: () => ({
    builtinTools: [
      {
        identifier: 'search',
        manifest: {
          api: [
            {
              description: 'Search the web',
              name: 'search',
              parameters: {
                properties: {
                  query: { description: 'Search query', type: 'string' },
                },
                required: ['query'],
                type: 'object',
              },
            },
          ],
          identifier: 'search',
          meta: {
            title: 'Web Search',
            description: 'Search tool',
            avatar: '🔍',
          },
          type: 'builtin',
        } as unknown as LobeChatPluginManifest,
        type: 'builtin' as const,
      },
    ],
  }),
}));

vi.mock('@/store/tool/selectors', () => ({
  pluginSelectors: {
    installedPluginManifestList: () => [],
  },
}));

vi.mock('./helper', () => ({
  isCanUseFC: () => true,
}));

describe('toolEngineering', () => {
  describe('generateTools', () => {
    it('should generate tools array for enabled plugins', () => {
      const result = generateTools(['search'], {
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result![0]).toMatchObject({
        function: {
          description: 'Search the web',
          name: 'search____search____builtin',
          parameters: {
            properties: {
              query: { description: 'Search query', type: 'string' },
            },
            required: ['query'],
            type: 'object',
          },
        },
        type: 'function',
      });
    });

    it('should return undefined when no plugins match', () => {
      const result = generateTools(['non-existent'], {
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toBeUndefined();
    });
  });
});
