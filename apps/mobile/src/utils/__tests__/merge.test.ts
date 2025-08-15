// Mock lodash-es to avoid ES module issues in Jest
jest.mock('lodash-es', () => ({
  merge: jest.fn((target, source, customizer) => {
    const result = { ...target };
    Object.keys(source).forEach((key) => {
      if (customizer) {
        const merged = customizer(result[key], source[key]);
        result[key] = merged !== undefined ? merged : source[key];
      } else {
        // Handle nested objects
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof result[key] === 'object' &&
          result[key] !== null &&
          !Array.isArray(result[key])
        ) {
          result[key] = { ...result[key], ...source[key] };
        } else {
          result[key] = source[key];
        }
      }
    });
    return result;
  }),
  isEmpty: jest.fn((value) => {
    if (value == null) return true;
    if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }),
  mergeWith: jest.fn((target, source1, source2, customizer) => {
    // Implementation that mimics lodash mergeWith behavior
    const deepMerge = (target, source, customizer) => {
      const result = { ...target };
      Object.keys(source).forEach((key) => {
        if (customizer) {
          const customResult = customizer(result[key], source[key]);
          if (customResult !== undefined) {
            result[key] = customResult;
            return;
          }
        }

        // Default merging behavior
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof result[key] === 'object' &&
          result[key] !== null &&
          !Array.isArray(result[key])
        ) {
          result[key] = deepMerge(result[key], source[key], customizer);
        } else {
          result[key] = source[key];
        }
      });
      return result;
    };

    let result = { ...target };
    const sources = [source1, source2].filter((s) => s != null);
    sources.forEach((source) => {
      result = deepMerge(result, source, customizer);
    });
    return result;
  }),
}));

import { merge, mergeArrayById } from '../merge';

describe('merge utilities', () => {
  describe('merge', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
      expect(target).toEqual({ a: 1, b: 2 }); // original should not be mutated
    });

    it('should merge nested objects', () => {
      const target = {
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark' },
      };
      const source = {
        user: { age: 31, email: 'john@example.com' },
        settings: { language: 'en' },
      };
      const result = merge(target, source);

      expect(result).toEqual({
        user: { name: 'John', age: 31, email: 'john@example.com' },
        settings: { theme: 'dark', language: 'en' },
      });
    });

    it('should replace arrays instead of merging them', () => {
      const target = { items: [1, 2, 3], other: 'value' };
      const source = { items: [4, 5], other: 'new' };
      const result = merge(target, source);

      expect(result).toEqual({ items: [4, 5], other: 'new' });
    });

    it('should handle empty objects', () => {
      expect(merge({}, { a: 1 })).toEqual({ a: 1 });
      expect(merge({ a: 1 }, {})).toEqual({ a: 1 });
      expect(merge({}, {})).toEqual({});
    });

    it('should handle null and undefined values', () => {
      const target = { a: 1, b: null, c: undefined };
      const source = { a: null, b: 2, d: undefined };
      const result = merge(target, source);

      expect(result).toEqual({ a: null, b: 2, c: undefined, d: undefined });
    });
  });

  describe('mergeArrayById', () => {
    interface TestItem {
      id: string;
      name: string;
      config?: {
        enabled: boolean;
        value: number;
      };
      tags?: string[];
    }

    const defaultItems: TestItem[] = [
      {
        id: '1',
        name: 'Item 1',
        config: { enabled: true, value: 10 },
        tags: ['default'],
      },
      {
        id: '2',
        name: 'Item 2',
        config: { enabled: false, value: 20 },
        tags: ['default', 'system'],
      },
      {
        id: '3',
        name: 'Item 3',
        config: { enabled: true, value: 30 },
      },
    ];

    it('should merge user items with default items', () => {
      const userItems: TestItem[] = [
        { id: '1', name: 'Custom Item 1', config: { enabled: false, value: 15 } },
        { id: '2', name: 'Custom Item 2' },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(3);
      expect(result.find((item) => item.id === '1')).toEqual({
        id: '1',
        name: 'Custom Item 1',
        config: { enabled: false, value: 15 },
        tags: ['default'],
      });
      expect(result.find((item) => item.id === '2')).toEqual({
        id: '2',
        name: 'Custom Item 2',
        config: { enabled: false, value: 20 },
        tags: ['default', 'system'],
      });
      expect(result.find((item) => item.id === '3')).toEqual({
        id: '3',
        name: 'Item 3',
        config: { enabled: true, value: 30 },
      });
    });

    it("should add new user items that don't exist in defaults", () => {
      const userItems: TestItem[] = [
        { id: '4', name: 'New Item', config: { enabled: true, value: 40 } },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(4);
      expect(result.find((item) => item.id === '4')).toEqual({
        id: '4',
        name: 'New Item',
        config: { enabled: true, value: 40 },
      });
    });

    it('should preserve default items not overridden by user', () => {
      const userItems: TestItem[] = [{ id: '1', name: 'Modified Item' }];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(3);
      expect(result.find((item) => item.id === '2')).toEqual(defaultItems[1]);
      expect(result.find((item) => item.id === '3')).toEqual(defaultItems[2]);
    });

    it('should handle empty user items', () => {
      const result = mergeArrayById(defaultItems, []);
      expect(result).toEqual(defaultItems);
    });

    it('should handle empty default items', () => {
      const userItems: TestItem[] = [{ id: '1', name: 'User Item' }];
      const result = mergeArrayById([], userItems);
      expect(result).toEqual(userItems);
    });

    it('should handle duplicate IDs in user items (last wins)', () => {
      const userItems: TestItem[] = [
        { id: '1', name: 'First' },
        { id: '1', name: 'Second' },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result.find((item) => item.id === '1')?.name).toBe('Second');
    });

    it('should not merge null or undefined values', () => {
      const userItems: TestItem[] = [
        {
          id: '1',
          name: 'Test',
          // @ts-expect-error - testing null values
          config: null,
          // @ts-expect-error - testing undefined values
          tags: undefined,
        },
      ];

      const result = mergeArrayById(defaultItems, userItems);
      const mergedItem = result.find((item) => item.id === '1');

      expect(mergedItem?.config).toEqual({ enabled: true, value: 10 });
      expect(mergedItem?.tags).toEqual(['default']);
    });

    it('should merge nested objects properly', () => {
      const userItems: TestItem[] = [
        {
          id: '1',
          name: 'Test',
          config: { enabled: false, value: 99 }, // partial override
        },
      ];

      const result = mergeArrayById(defaultItems, userItems);
      const mergedItem = result.find((item) => item.id === '1');

      expect(mergedItem?.config).toEqual({ enabled: false, value: 99 });
    });
  });
});
