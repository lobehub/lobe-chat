import { describe, expect, it } from 'vitest';

import { merge } from './merge';

describe('merge', () => {
  describe('basic object merging', () => {
    it('should merge two simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { c: 3, d: 4 };

      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('should override target properties with source properties', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should handle empty target object', () => {
      const target = {};
      const source = { a: 1, b: 2 };

      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle empty source object', () => {
      const target = { a: 1, b: 2 };
      const source = {};

      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle both empty objects', () => {
      const target = {};
      const source = {};

      const result = merge(target, source);

      expect(result).toEqual({});
    });
  });

  describe('nested object merging', () => {
    it('should merge nested objects deeply', () => {
      const target = {
        a: 1,
        nested: {
          b: 2,
          c: 3,
        },
      };
      const source = {
        nested: {
          c: 4,
          d: 5,
        },
      };

      const result = merge(target, source);

      expect(result).toEqual({
        a: 1,
        nested: {
          b: 2,
          c: 4,
          d: 5,
        },
      });
    });

    it('should handle deeply nested objects', () => {
      const target = {
        level1: {
          level2: {
            level3: {
              value: 'original',
              keep: true,
            },
          },
        },
      };
      const source = {
        level1: {
          level2: {
            level3: {
              value: 'updated',
            },
          },
        },
      };

      const result = merge(target, source);

      expect(result.level1.level2.level3).toEqual({
        value: 'updated',
        keep: true,
      });
    });

    it('should merge nested objects with different structures', () => {
      const target = {
        config: {
          timeout: 5000,
          retry: 3,
        },
      };
      const source = {
        config: {
          timeout: 3000,
        },
        metadata: {
          version: '1.0',
        },
      };

      const result = merge(target, source);

      expect(result).toEqual({
        config: {
          timeout: 3000,
          retry: 3,
        },
        metadata: {
          version: '1.0',
        },
      });
    });
  });

  describe('array handling - replacement behavior', () => {
    it('should replace target array with source array completely', () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [4, 5] };

      const result = merge(target, source);

      expect(result.items).toEqual([4, 5]);
      expect(result.items).not.toEqual([1, 2, 3, 4, 5]);
    });

    it('should replace nested array values', () => {
      const target = {
        config: {
          values: ['a', 'b', 'c'],
        },
      };
      const source = {
        config: {
          values: ['x', 'y'],
        },
      };

      const result = merge(target, source);

      expect(result.config.values).toEqual(['x', 'y']);
    });

    it('should replace array with empty array', () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [] };

      const result = merge(target, source);

      expect(result.items).toEqual([]);
    });

    it('should replace empty array with values', () => {
      const target = { items: [] };
      const source = { items: [1, 2, 3] };

      const result = merge(target, source);

      expect(result.items).toEqual([1, 2, 3]);
    });

    it('should handle arrays of objects', () => {
      const target = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      };
      const source = {
        users: [{ id: 3, name: 'Charlie' }],
      };

      const result = merge(target, source);

      expect(result.users).toEqual([{ id: 3, name: 'Charlie' }]);
      expect(result.users).toHaveLength(1);
    });
  });

  describe('mixed type scenarios', () => {
    it('should handle objects with arrays and nested objects', () => {
      const target = {
        name: 'config',
        items: [1, 2, 3],
        settings: {
          enabled: true,
          options: ['a', 'b'],
        },
      };
      const source = {
        items: [4, 5],
        settings: {
          enabled: false,
          options: ['c'],
        },
      };

      const result = merge(target, source);

      expect(result).toEqual({
        name: 'config',
        items: [4, 5],
        settings: {
          enabled: false,
          options: ['c'],
        },
      });
    });

    it('should handle boolean values', () => {
      const target = { enabled: true, visible: false };
      const source = { enabled: false };

      const result = merge(target, source);

      expect(result).toEqual({ enabled: false, visible: false });
    });

    it('should handle numeric values including zero', () => {
      const target = { count: 5, value: 100 };
      const source = { count: 0, value: 200 };

      const result = merge(target, source);

      expect(result).toEqual({ count: 0, value: 200 });
    });

    it('should handle string values including empty strings', () => {
      const target = { name: 'original', description: 'test' };
      const source = { name: '', description: 'updated' };

      const result = merge(target, source);

      expect(result).toEqual({ name: '', description: 'updated' });
    });

    it('should handle null values', () => {
      const target = { value: 'something' as string | null, other: null };
      const source = { value: null };

      const result = merge(target, source);

      expect(result.value).toBeNull();
      expect(result.other).toBeNull();
    });

    it('should handle undefined values by keeping target values', () => {
      const target = { a: 1, b: 2 as number | undefined };
      const source = { b: undefined, c: 3 };

      const result = merge(target, source);

      // lodash merge doesn't override with undefined - keeps original value
      expect(result.b).toBe(2);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });
  });

  describe('immutability', () => {
    it('should not mutate the target object', () => {
      const target = { a: 1, b: 2 };
      const targetClone = { ...target };
      const source = { b: 3, c: 4 };

      merge(target, source);

      expect(target).toEqual(targetClone);
    });

    it('should not mutate the source object', () => {
      const target = { a: 1 };
      const source = { b: 2, c: 3 };
      const sourceClone = { ...source };

      merge(target, source);

      expect(source).toEqual(sourceClone);
    });

    it('should return a new object reference', () => {
      const target = { a: 1 };
      const source = { b: 2 };

      const result = merge(target, source);

      expect(result).not.toBe(target);
      expect(result).not.toBe(source);
    });

    it('should not mutate nested objects in target', () => {
      const target = {
        nested: { value: 1 },
      };
      const targetNestedClone = { ...target.nested };
      const source = {
        nested: { value: 2 },
      };

      merge(target, source);

      expect(target.nested).toEqual(targetNestedClone);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with many properties', () => {
      const target = {
        prop1: 1,
        prop2: 2,
        prop3: 3,
        prop4: 4,
        prop5: 5,
      };
      const source = {
        prop3: 30,
        prop4: 40,
        prop6: 6,
        prop7: 7,
      };

      const result = merge(target, source);

      expect(result).toEqual({
        prop1: 1,
        prop2: 2,
        prop3: 30,
        prop4: 40,
        prop5: 5,
        prop6: 6,
        prop7: 7,
      });
    });

    it('should not copy symbol keys (lodash limitation)', () => {
      const sym = Symbol('test');
      const target = { [sym]: 'target', a: 1 };
      const source = { [sym]: 'source', b: 2 };

      const result = merge(target, source);

      // lodash merge doesn't copy symbol keys
      expect(result[sym]).toBeUndefined();
      expect(result).toMatchObject({ a: 1, b: 2 });
    });

    it('should handle date objects', () => {
      const targetDate = new Date('2024-01-01');
      const sourceDate = new Date('2024-12-31');
      const target = { date: targetDate };
      const source = { date: sourceDate };

      const result = merge(target, source);

      expect(result.date).toBe(sourceDate);
    });

    it('should handle function properties', () => {
      const targetFn = () => 'target';
      const sourceFn = () => 'source';
      const target = { fn: targetFn };
      const source = { fn: sourceFn };

      const result = merge(target, source);

      expect(result.fn).toBe(sourceFn);
      expect(result.fn()).toBe('source');
    });

    it('should handle complex real-world config merging scenario', () => {
      const defaultConfig = {
        api: {
          baseUrl: 'https://api.example.com',
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Default/1.0',
          },
          endpoints: ['/users', '/posts', '/comments'],
        },
        features: {
          darkMode: true,
          notifications: false,
        },
      };

      const userConfig = {
        api: {
          timeout: 3000,
          headers: {
            'User-Agent': 'Custom/2.0',
            'Authorization': 'Bearer token',
          },
          endpoints: ['/users', '/products'],
        },
        features: {
          notifications: true,
        },
      };

      const result = merge(defaultConfig, userConfig);

      expect(result).toEqual({
        api: {
          baseUrl: 'https://api.example.com',
          timeout: 3000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Custom/2.0',
            'Authorization': 'Bearer token',
          },
          endpoints: ['/users', '/products'],
        },
        features: {
          darkMode: true,
          notifications: true,
        },
      });
    });
  });
});
