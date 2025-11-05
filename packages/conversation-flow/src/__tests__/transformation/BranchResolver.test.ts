import { describe, expect, it } from 'vitest';

import { BranchResolver } from '../../transformation/BranchResolver';
import type { IdNode, Message } from '../../types';

describe('BranchResolver', () => {
  const resolver = new BranchResolver();

  describe('getActiveBranchId', () => {
    it('should return activeBranchId from metadata when present', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        metadata: { activeBranchId: 'msg-3' },
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const idNode: IdNode = {
        children: [
          { children: [], id: 'msg-2' },
          { children: [], id: 'msg-3' },
        ],
        id: 'msg-1',
      };

      expect(resolver.getActiveBranchId(message, idNode)).toBe('msg-3');
    });

    it('should return branch by activeBranchIndex from metadata when present', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        metadata: { activeBranchIndex: 1 },
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const idNode: IdNode = {
        children: [
          { children: [], id: 'msg-2' },
          { children: [], id: 'msg-3' },
        ],
        id: 'msg-1',
      };

      expect(resolver.getActiveBranchId(message, idNode)).toBe('msg-3');
    });

    it('should infer active branch from which branch has children', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const idNode: IdNode = {
        children: [
          { children: [], id: 'msg-2' },
          { children: [{ children: [], id: 'msg-4' }], id: 'msg-3' },
        ],
        id: 'msg-1',
      };

      expect(resolver.getActiveBranchId(message, idNode)).toBe('msg-3');
    });

    it('should default to first branch when no hints available', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const idNode: IdNode = {
        children: [
          { children: [], id: 'msg-2' },
          { children: [], id: 'msg-3' },
        ],
        id: 'msg-1',
      };

      expect(resolver.getActiveBranchId(message, idNode)).toBe('msg-2');
    });

    it('should ignore invalid activeBranchIndex', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        metadata: { activeBranchIndex: 5 }, // out of bounds
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const idNode: IdNode = {
        children: [
          { children: [], id: 'msg-2' },
          { children: [], id: 'msg-3' },
        ],
        id: 'msg-1',
      };

      // Should default to first branch
      expect(resolver.getActiveBranchId(message, idNode)).toBe('msg-2');
    });
  });

  describe('getActiveBranchIdFromMetadata', () => {
    it('should return activeBranchId from metadata when present and valid', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        metadata: { activeBranchId: 'msg-3' },
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const childIds = ['msg-2', 'msg-3'];
      const childrenMap = new Map<string | null, string[]>();

      expect(resolver.getActiveBranchIdFromMetadata(message, childIds, childrenMap)).toBe('msg-3');
    });

    it('should return branch by activeBranchIndex from metadata', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        metadata: { activeBranchIndex: 1 },
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const childIds = ['msg-2', 'msg-3'];
      const childrenMap = new Map<string | null, string[]>();

      expect(resolver.getActiveBranchIdFromMetadata(message, childIds, childrenMap)).toBe('msg-3');
    });

    it('should infer active branch from which child has descendants', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const childIds = ['msg-2', 'msg-3'];
      const childrenMap = new Map<string | null, string[]>([
        ['msg-2', []],
        ['msg-3', ['msg-4']],
      ]);

      expect(resolver.getActiveBranchIdFromMetadata(message, childIds, childrenMap)).toBe('msg-3');
    });

    it('should default to first child when no hints available', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const childIds = ['msg-2', 'msg-3'];
      const childrenMap = new Map<string | null, string[]>();

      expect(resolver.getActiveBranchIdFromMetadata(message, childIds, childrenMap)).toBe('msg-2');
    });

    it('should ignore activeBranchId if not in childIds', () => {
      const message: Message = {
        content: 'test',
        createdAt: 0,
        id: 'msg-1',
        meta: {},
        metadata: { activeBranchId: 'msg-999' }, // not in childIds
        parentId: null,
        role: 'user',
        updatedAt: 0,
      };

      const childIds = ['msg-2', 'msg-3'];
      const childrenMap = new Map<string | null, string[]>();

      // Should default to first child
      expect(resolver.getActiveBranchIdFromMetadata(message, childIds, childrenMap)).toBe('msg-2');
    });
  });
});
