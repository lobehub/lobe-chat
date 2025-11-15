import { describe, expect, it } from 'vitest';

import { merge, mergeArrayById } from './merge';

describe('merge', () => {
  describe('basic object merging', () => {
    it('should merge two simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
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

    it('should handle empty source', () => {
      const target = { a: 1 };
      const source = {};
      const result = merge(target, source);

      expect(result).toEqual({ a: 1 });
    });
  });

  describe('array replacement behavior', () => {
    it('should replace arrays instead of merging them', () => {
      const target = { arr: [1, 2, 3] };
      const source = { arr: [4, 5] };
      const result = merge(target, source);

      expect(result).toEqual({ arr: [4, 5] });
    });

    it('should replace nested arrays', () => {
      const target = { nested: { arr: [1, 2] } };
      const source = { nested: { arr: [3, 4, 5] } };
      const result = merge(target, source);

      expect(result).toEqual({ nested: { arr: [3, 4, 5] } });
    });

    it('should replace empty array with non-empty array', () => {
      const target = { arr: [] };
      const source = { arr: [1, 2] };
      const result = merge(target, source);

      expect(result).toEqual({ arr: [1, 2] });
    });

    it('should replace non-empty array with empty array', () => {
      const target = { arr: [1, 2, 3] };
      const source = { arr: [] };
      const result = merge(target, source);

      expect(result).toEqual({ arr: [] });
    });
  });

  describe('complex merging scenarios', () => {
    it('should merge deeply nested objects with arrays', () => {
      const target = {
        level1: {
          level2: {
            arr: [1, 2],
            obj: { a: 1 },
          },
        },
      };
      const source = {
        level1: {
          level2: {
            arr: [3],
            obj: { b: 2 },
          },
        },
      };
      const result = merge(target, source);

      expect(result).toEqual({
        level1: {
          level2: {
            arr: [3],
            obj: { a: 1, b: 2 },
          },
        },
      });
    });

    it('should handle undefined values', () => {
      const target = { a: 1, b: undefined };
      const source = { b: 2, c: undefined };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2, c: undefined });
    });

    it('should handle null values', () => {
      const target = { a: 1, b: null };
      const source = { b: 2, c: null };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2, c: null });
    });
  });
});

describe('mergeArrayById', () => {
  type TestItem = {
    id: string;
    name: string;
    value?: number;
  };

  describe('basic array merging', () => {
    it('should merge arrays by id', () => {
      const defaultItems: TestItem[] = [
        { id: '1', name: 'default1', value: 10 },
        { id: '2', name: 'default2', value: 20 },
      ];
      const userItems: TestItem[] = [
        { id: '1', name: 'user1', value: 15 },
        { id: '3', name: 'user3', value: 30 },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { id: '1', name: 'user1', value: 15 },
        { id: '3', name: 'user3', value: 30 },
        { id: '2', name: 'default2', value: 20 },
      ]);
    });

    it('should preserve default items when not in user items', () => {
      const defaultItems: TestItem[] = [
        { id: '1', name: 'default1', value: 10 },
        { id: '2', name: 'default2', value: 20 },
        { id: '3', name: 'default3', value: 30 },
      ];
      const userItems: TestItem[] = [{ id: '1', name: 'user1', value: 15 }];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(3);
      expect(result.find((item) => item.id === '2')).toEqual({
        id: '2',
        name: 'default2',
        value: 20,
      });
      expect(result.find((item) => item.id === '3')).toEqual({
        id: '3',
        name: 'default3',
        value: 30,
      });
    });

    it('should add new user items not in defaults', () => {
      const defaultItems: TestItem[] = [{ id: '1', name: 'default1', value: 10 }];
      const userItems: TestItem[] = [
        { id: '2', name: 'user2', value: 20 },
        { id: '3', name: 'user3', value: 30 },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(3);
      expect(result.find((item) => item.id === '2')).toEqual({
        id: '2',
        name: 'user2',
        value: 20,
      });
      expect(result.find((item) => item.id === '3')).toEqual({
        id: '3',
        name: 'user3',
        value: 30,
      });
    });
  });

  describe('empty array handling', () => {
    it('should handle empty default items', () => {
      const defaultItems: TestItem[] = [];
      const userItems: TestItem[] = [{ id: '1', name: 'user1', value: 10 }];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toEqual([{ id: '1', name: 'user1', value: 10 }]);
    });

    it('should handle empty user items', () => {
      const defaultItems: TestItem[] = [{ id: '1', name: 'default1', value: 10 }];
      const userItems: TestItem[] = [];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toEqual([{ id: '1', name: 'default1', value: 10 }]);
    });

    it('should handle both arrays empty', () => {
      const defaultItems: TestItem[] = [];
      const userItems: TestItem[] = [];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toEqual([]);
    });
  });

  describe('metadata preservation', () => {
    it('should preserve default metadata when user provides partial data', () => {
      type ItemWithMetadata = {
        description?: string;
        id: string;
        metadata?: Record<string, any>;
        name: string;
        value?: number;
      };

      const defaultItems: ItemWithMetadata[] = [
        {
          description: 'default description',
          id: '1',
          metadata: { created: '2024-01-01', type: 'default' },
          name: 'default1',
          value: 10,
        },
      ];
      const userItems: ItemWithMetadata[] = [
        {
          id: '1',
          name: 'user1',
          value: 15,
        },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toEqual([
        {
          description: 'default description',
          id: '1',
          metadata: { created: '2024-01-01', type: 'default' },
          name: 'user1',
          value: 15,
        },
      ]);
    });

    it('should merge nested objects in metadata', () => {
      type ItemWithNested = {
        config?: {
          nested?: Record<string, any>;
          option1?: boolean;
          option2?: boolean;
        };
        id: string;
        name: string;
      };

      const defaultItems: ItemWithNested[] = [
        {
          config: {
            nested: { a: 1, b: 2 },
            option1: true,
            option2: false,
          },
          id: '1',
          name: 'default1',
        },
      ];
      const userItems: ItemWithNested[] = [
        {
          config: {
            nested: { b: 3, c: 4 },
            option1: false,
          },
          id: '1',
          name: 'user1',
        },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toEqual([
        {
          config: {
            nested: { a: 1, b: 3, c: 4 },
            option1: false,
            option2: false,
          },
          id: '1',
          name: 'user1',
        },
      ]);
    });
  });

  describe('null and undefined handling', () => {
    it('should not override with null values', () => {
      type ItemWithOptional = {
        id: string;
        name: string;
        value: number | null;
      };

      const defaultItems: ItemWithOptional[] = [{ id: '1', name: 'default1', value: 10 }];
      const userItems: ItemWithOptional[] = [{ id: '1', name: 'user1', value: null }];

      const result = mergeArrayById(defaultItems, userItems);

      // null values should be ignored and keep default
      expect(result).toEqual([{ id: '1', name: 'user1', value: 10 }]);
    });

    it('should not override with undefined values', () => {
      type ItemWithOptional = {
        id: string;
        name: string;
        value?: number;
      };

      const defaultItems: ItemWithOptional[] = [{ id: '1', name: 'default1', value: 10 }];
      const userItems: ItemWithOptional[] = [{ id: '1', name: 'user1', value: undefined }];

      const result = mergeArrayById(defaultItems, userItems);

      // undefined values should be ignored and keep default
      expect(result).toEqual([{ id: '1', name: 'user1', value: 10 }]);
    });

    it('should not override with empty objects', () => {
      type ItemWithConfig = {
        config?: Record<string, any>;
        id: string;
        name: string;
      };

      const defaultItems: ItemWithConfig[] = [
        { config: { option: true }, id: '1', name: 'default1' },
      ];
      const userItems: ItemWithConfig[] = [{ config: {}, id: '1', name: 'user1' }];

      const result = mergeArrayById(defaultItems, userItems);

      // empty objects should be ignored and keep default
      expect(result).toEqual([{ config: { option: true }, id: '1', name: 'user1' }]);
    });
  });

  describe('duplicate ID handling', () => {
    it('should use the last occurrence when user items have duplicate IDs', () => {
      const defaultItems: TestItem[] = [{ id: '1', name: 'default1', value: 10 }];
      const userItems: TestItem[] = [
        { id: '1', name: 'user1-first', value: 15 },
        { id: '1', name: 'user1-last', value: 20 },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: '1', name: 'user1-last', value: 20 });
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed operations: add, update, keep defaults', () => {
      type ComplexItem = {
        config?: Record<string, any>;
        id: string;
        name: string;
        value?: number;
      };

      const defaultItems: ComplexItem[] = [
        { config: { enabled: true }, id: '1', name: 'default1', value: 10 },
        { config: { enabled: false }, id: '2', name: 'default2', value: 20 },
        { config: { enabled: true }, id: '3', name: 'default3', value: 30 },
      ];
      const userItems: ComplexItem[] = [
        { config: { enabled: false }, id: '1', name: 'user1', value: 15 }, // update
        { id: '4', name: 'user4', value: 40 }, // add new
        // id '2' not in user items - should keep default
        { id: '3', name: 'user3' }, // partial update - keep default value and merge config
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(4);
      expect(result.find((item) => item.id === '1')).toEqual({
        config: { enabled: false },
        id: '1',
        name: 'user1',
        value: 15,
      });
      expect(result.find((item) => item.id === '2')).toEqual({
        config: { enabled: false },
        id: '2',
        name: 'default2',
        value: 20,
      });
      expect(result.find((item) => item.id === '3')).toEqual({
        config: { enabled: true },
        id: '3',
        name: 'user3',
        value: 30,
      });
      expect(result.find((item) => item.id === '4')).toEqual({
        id: '4',
        name: 'user4',
        value: 40,
      });
    });
  });
});
