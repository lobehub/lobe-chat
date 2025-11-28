import { describe, expect, it } from 'vitest';

import { merge, mergeArrayById } from './merge';

describe('merge', () => {
  describe('basic object merging', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should not mutate original objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      merge(target, source);

      expect(target).toEqual({ a: 1 });
      expect(source).toEqual({ b: 2 });
    });

    it('should merge nested objects', () => {
      const target = { a: { b: 1, c: 2 } };
      const source = { a: { c: 3, d: 4 } };
      const result = merge(target, source);

      expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
    });

    it('should handle empty objects', () => {
      const target = {};
      const source = { a: 1 };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1 });
    });

    it('should handle both empty objects', () => {
      const target = {};
      const source = {};
      const result = merge(target, source);

      expect(result).toEqual({});
    });
  });

  describe('array replacement behavior', () => {
    it('should replace arrays instead of merging them', () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [4, 5] };
      const result = merge(target, source);

      expect(result).toEqual({ items: [4, 5] });
    });

    it('should replace empty array with non-empty array', () => {
      const target = { items: [] };
      const source = { items: [1, 2] };
      const result = merge(target, source);

      expect(result).toEqual({ items: [1, 2] });
    });

    it('should replace array with empty array', () => {
      const target = { items: [1, 2] };
      const source = { items: [] };
      const result = merge(target, source);

      expect(result).toEqual({ items: [] });
    });

    it('should replace nested arrays', () => {
      const target = { a: { b: [1, 2] } };
      const source = { a: { b: [3, 4] } };
      const result = merge(target, source);

      expect(result).toEqual({ a: { b: [3, 4] } });
    });
  });

  describe('complex merging scenarios', () => {
    it('should handle multiple levels of nesting', () => {
      const target = { a: { b: { c: { d: 1 } } } };
      const source = { a: { b: { c: { e: 2 } } } };
      const result = merge(target, source);

      expect(result).toEqual({ a: { b: { c: { d: 1, e: 2 } } } });
    });

    it('should handle mixed types in nested objects', () => {
      const target = { a: 1, b: { c: 2 }, d: [1, 2] };
      const source = { b: { e: 3 }, d: [3, 4], f: 'test' };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: { c: 2, e: 3 }, d: [3, 4], f: 'test' });
    });

    it('should handle null values', () => {
      const target = { a: 1, b: null };
      const source = { b: 2, c: null };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2, c: null });
    });

    it('should handle undefined values', () => {
      const target = { a: 1, b: undefined };
      const source = { b: 2, c: undefined };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2, c: undefined });
    });
  });
});

describe('mergeArrayById', () => {
  describe('basic array merging by id', () => {
    it('should merge arrays based on id', () => {
      const defaultItems = [
        { id: '1', name: 'Item 1', value: 10 },
        { id: '2', name: 'Item 2', value: 20 },
      ];
      const userItems = [{ id: '1', value: 15 }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(2);
      expect(result.find((item) => item.id === '1')).toEqual({
        id: '1',
        name: 'Item 1',
        value: 15,
      });
      expect(result.find((item) => item.id === '2')).toEqual({
        id: '2',
        name: 'Item 2',
        value: 20,
      });
    });

    it('should preserve metadata from default items', () => {
      const defaultItems = [{ id: '1', name: 'Item 1', metadata: { version: '1.0' } }];
      const userItems = [{ id: '1', value: 100 }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Item 1',
        metadata: { version: '1.0' },
        value: 100,
      });
    });

    it('should add user items that do not exist in defaults', () => {
      const defaultItems = [{ id: '1', name: 'Item 1' }];
      const userItems = [
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(3);
      expect(result.find((item) => item.id === '1')).toBeDefined();
      expect(result.find((item) => item.id === '2')).toBeDefined();
      expect(result.find((item) => item.id === '3')).toBeDefined();
    });

    it('should keep default items when not overridden', () => {
      const defaultItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];
      const userItems = [{ id: '1', name: 'Updated Item 1' }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(3);
      expect(result.find((item) => item.id === '2')).toEqual({ id: '2', name: 'Item 2' });
      expect(result.find((item) => item.id === '3')).toEqual({ id: '3', name: 'Item 3' });
    });
  });

  describe('empty and edge cases', () => {
    it('should handle empty default items', () => {
      const defaultItems: Array<{ id: string; name: string }> = [];
      const userItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(2);
      expect(result).toEqual(userItems);
    });

    it('should handle empty user items', () => {
      const defaultItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const userItems: Array<{ id: string; name: string }> = [];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(2);
      expect(result).toEqual(defaultItems);
    });

    it('should handle both empty arrays', () => {
      const defaultItems: Array<{ id: string }> = [];
      const userItems: Array<{ id: string }> = [];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(0);
    });

    it('should handle duplicate ids in user items', () => {
      const defaultItems = [{ id: '1', name: 'Item 1', value: 10 }];
      const userItems = [
        { id: '1', value: 20 },
        { id: '1', value: 30 },
      ];
      const result = mergeArrayById(defaultItems, userItems);

      // Last occurrence should win
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(30);
    });
  });

  describe('null and undefined handling', () => {
    it('should not override with null values', () => {
      const defaultItems = [{ id: '1', name: 'Item 1', value: 10 }];
      const userItems = [{ id: '1', value: null as any }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0].value).toBe(10);
    });

    it('should not override with undefined values', () => {
      const defaultItems = [{ id: '1', name: 'Item 1', value: 10 }];
      const userItems = [{ id: '1', value: undefined as any }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0].value).toBe(10);
    });

    it('should not override with empty objects', () => {
      const defaultItems = [{ id: '1', name: 'Item 1', config: { a: 1, b: 2 } }];
      const userItems = [{ id: '1', config: {} }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0].config).toEqual({ a: 1, b: 2 });
    });

    it('should not override with empty arrays', () => {
      const defaultItems = [{ id: '1', name: 'Item 1', items: [1, 2, 3] }];
      const userItems = [{ id: '1', items: [] }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0].items).toEqual([1, 2, 3]);
    });
  });

  describe('nested object merging in arrays', () => {
    it('should merge nested objects within array items', () => {
      const defaultItems = [{ id: '1', config: { a: 1, b: 2 } }];
      const userItems = [{ id: '1', config: { b: 3, c: 4 } }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0].config).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should handle deeply nested objects', () => {
      const defaultItems = [{ id: '1', data: { level1: { level2: { value: 1 } } } }];
      const userItems = [{ id: '1', data: { level1: { level2: { extra: 2 } } } }];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0].data).toEqual({ level1: { level2: { value: 1, extra: 2 } } });
    });

    it('should merge multiple properties correctly', () => {
      const defaultItems = [
        {
          id: '1',
          name: 'Item 1',
          config: { setting1: true, setting2: false },
          metadata: { version: '1.0', author: 'default' },
        },
      ];
      const userItems = [
        {
          id: '1',
          config: { setting2: true },
          metadata: { author: 'user' },
          extra: 'data',
        },
      ];
      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0]).toEqual({
        id: '1',
        name: 'Item 1',
        config: { setting1: true, setting2: true },
        metadata: { version: '1.0', author: 'user' },
        extra: 'data',
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle AI provider configuration merging', () => {
      const defaultProviders = [
        {
          id: 'openai',
          name: 'OpenAI',
          enabled: true,
          config: { apiKey: '', model: 'gpt-4', maxTokens: 2000 },
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          enabled: false,
          config: { apiKey: '', model: 'claude-3', maxTokens: 4000 },
        },
      ];

      const userProviders = [
        {
          id: 'openai',
          config: { apiKey: 'user-key-123', maxTokens: 4000 },
        },
        {
          id: 'custom',
          name: 'Custom Provider',
          enabled: true,
          config: { endpoint: 'https://custom.api' },
        },
      ];

      const result = mergeArrayById(defaultProviders, userProviders);

      expect(result).toHaveLength(3);
      expect(result.find((p) => p.id === 'openai')).toEqual({
        id: 'openai',
        name: 'OpenAI',
        enabled: true,
        config: { apiKey: 'user-key-123', model: 'gpt-4', maxTokens: 4000 },
      });
      expect(result.find((p) => p.id === 'anthropic')).toBeDefined();
      expect(result.find((p) => p.id === 'custom')).toBeDefined();
    });

    it('should handle plugin configuration merging', () => {
      const defaultPlugins = [
        {
          id: 'search',
          name: 'Search Plugin',
          version: '1.0.0',
          settings: { enabled: true, maxResults: 10 },
        },
      ];

      const userPlugins = [
        {
          id: 'search',
          settings: { maxResults: 20, customParam: 'value' },
        },
      ];

      const result = mergeArrayById(defaultPlugins, userPlugins);

      expect(result[0]).toEqual({
        id: 'search',
        name: 'Search Plugin',
        version: '1.0.0',
        settings: { enabled: true, maxResults: 20, customParam: 'value' },
      });
    });
  });
});
