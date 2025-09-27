import { describe, expect, it, vi } from 'vitest';

import { ToolsEngine } from '../ToolsEngine';
import type { LobeChatPluginManifest } from '../types';

// Mock manifest schemas for testing
const mockWebBrowsingManifest: LobeChatPluginManifest = {
  api: [
    {
      description: 'Search the web',
      name: 'search',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
  ],
  identifier: 'lobe-web-browsing',
  meta: {
    title: 'Web Browsing',
    description: 'Browse the web',
  },
  type: 'builtin',
};

const mockDalleManifest: LobeChatPluginManifest = {
  api: [
    {
      description: 'Generate images',
      name: 'generateImage',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Image prompt' },
        },
        required: ['prompt'],
      },
    },
  ],
  identifier: 'dalle',
  meta: {
    title: 'DALL-E',
    description: 'Generate images',
  },
  type: 'builtin',
};

describe('ToolsEngine', () => {
  describe('constructor', () => {
    it('should initialize with manifest schemas', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest, mockDalleManifest],
      });

      expect(engine.hasPlugin('lobe-web-browsing')).toBe(true);
      expect(engine.hasPlugin('dalle')).toBe(true);
      expect(engine.hasPlugin('non-existent')).toBe(false);
    });

    it('should store available plugins', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest, mockDalleManifest],
      });

      const availablePlugins = engine.getAvailablePlugins();
      expect(availablePlugins).toEqual(['lobe-web-browsing', 'dalle']);
    });
  });

  describe('generateTools', () => {
    it('should return undefined when function calling is not supported', () => {
      const mockFunctionCallChecker = vi.fn().mockReturnValue(false);
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
        functionCallChecker: mockFunctionCallChecker,
      });

      const result = engine.generateTools({
        pluginIds: ['lobe-web-browsing'],
        model: 'gpt-3.5-turbo',
        provider: 'openai',
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined when no plugins are enabled', () => {
      const mockEnableChecker = vi.fn().mockReturnValue(false);
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
        enableChecker: mockEnableChecker,
        functionCallChecker: () => true,
      });

      const result = engine.generateTools({
        pluginIds: ['lobe-web-browsing'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toBeUndefined();
      expect(mockEnableChecker).toHaveBeenCalledWith({
        pluginId: 'lobe-web-browsing',
        manifest: mockWebBrowsingManifest,
        model: 'gpt-4',
        provider: 'openai',
        context: undefined,
      });
    });

    it('should generate tools when plugins are enabled', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
        enableChecker: () => true,
        functionCallChecker: () => true,
      });

      const result = engine.generateTools({
        pluginIds: ['lobe-web-browsing'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toEqual([
        {
          type: 'function',
          function: {
            name: 'lobe-web-browsing____search____builtin',
            description: 'Search the web',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' },
              },
              required: ['query'],
            },
          },
        },
      ]);
    });

    it('should pass context to enable checker', () => {
      const mockEnableChecker = vi.fn().mockReturnValue(true);
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
        enableChecker: mockEnableChecker,
        functionCallChecker: () => true,
      });

      const context = { isSearchEnabled: true };
      engine.generateTools({
        pluginIds: ['lobe-web-browsing'],
        model: 'gpt-4',
        provider: 'openai',
        context,
      });

      expect(mockEnableChecker).toHaveBeenCalledWith({
        pluginId: 'lobe-web-browsing',
        manifest: mockWebBrowsingManifest,
        model: 'gpt-4',
        provider: 'openai',
        context,
      });
    });

    it('should handle non-existent plugins gracefully', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
        enableChecker: () => true,
        functionCallChecker: () => true,
      });

      const result = engine.generateTools({
        pluginIds: ['lobe-web-browsing', 'non-existent'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });

  describe('generateToolsDetailed', () => {
    it('should return detailed results with filtered plugins', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest, mockDalleManifest],
        enableChecker: ({ pluginId }) => pluginId === 'lobe-web-browsing',
        functionCallChecker: () => true,
      });

      const result = engine.generateToolsDetailed({
        pluginIds: ['lobe-web-browsing', 'dalle', 'non-existent'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result.tools).toHaveLength(1);
      expect(result.enabledPluginIds).toEqual(['lobe-web-browsing']);
      expect(result.filteredPlugins).toEqual([
        { pluginId: 'dalle', reason: 'disabled' },
        { pluginId: 'non-existent', reason: 'not_found' },
      ]);
    });
  });

  describe('plugin management', () => {
    it('should allow adding new plugin manifest', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
      });

      expect(engine.hasPlugin('dalle')).toBe(false);

      engine.addPluginManifest(mockDalleManifest);

      expect(engine.hasPlugin('dalle')).toBe(true);
      expect(engine.getPluginManifest('dalle')).toBe(mockDalleManifest);
    });

    it('should allow removing plugin manifest', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest, mockDalleManifest],
      });

      expect(engine.hasPlugin('dalle')).toBe(true);

      const removed = engine.removePluginManifest('dalle');

      expect(removed).toBe(true);
      expect(engine.hasPlugin('dalle')).toBe(false);
    });

    it('should allow updating all manifest schemas', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
      });

      expect(engine.getAvailablePlugins()).toEqual(['lobe-web-browsing']);

      engine.updateManifestSchemas([mockDalleManifest]);

      expect(engine.getAvailablePlugins()).toEqual(['dalle']);
    });
  });

  describe('default behavior', () => {
    it('should use default enable checker when none provided', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
        functionCallChecker: () => true,
      });

      const result = engine.generateTools({
        pluginIds: ['lobe-web-browsing'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('should use default function call checker when none provided', () => {
      const engine = new ToolsEngine({
        manifestSchemas: [mockWebBrowsingManifest],
        enableChecker: () => true,
      });

      const result = engine.generateTools({
        pluginIds: ['lobe-web-browsing'],
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });
});
