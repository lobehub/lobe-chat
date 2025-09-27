import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createToolsEngine } from './toolEngineering';

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
  getSearchConfig: vi.fn(),
  isCanUseFC: () => true,
}));

vi.mock('@/tools/web-browsing', () => ({
  WebBrowsingManifest: {
    identifier: 'web-browsing-tool',
  },
}));

describe('toolEngineering', () => {
  describe('createToolsEngine', () => {
    it('should generate tools array for enabled plugins', () => {
      const toolsEngine = createToolsEngine();
      const result = toolsEngine.generateTools({
        toolIds: ['search'],
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
      const toolsEngine = createToolsEngine();
      const result = toolsEngine.generateTools({
        toolIds: ['non-existent'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toBeUndefined();
    });

    it('should return detailed result with correct field names', () => {
      const toolsEngine = createToolsEngine();
      const result = toolsEngine.generateToolsDetailed({
        toolIds: ['search'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toHaveProperty('enabledToolIds');
      expect(result).toHaveProperty('filteredTools');
      expect(result).toHaveProperty('tools');
      expect(result.enabledToolIds).toEqual(['search']);
      expect(result.filteredTools).toEqual([]);
      expect(result.tools).toHaveLength(1);
    });
  });
});
