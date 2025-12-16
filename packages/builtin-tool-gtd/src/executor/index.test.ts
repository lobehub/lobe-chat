import type { BuiltinToolContext } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { gtdExecutor } from './index';

describe('GTDExecutor', () => {
  const createMockContext = (pluginState?: Record<string, unknown>): BuiltinToolContext => ({
    messageId: 'test-message-id',
    operationId: 'test-operation-id',
    pluginState,
  });

  describe('createTodos', () => {
    it('should add items to empty todo list', async () => {
      const ctx = createMockContext();

      const result = await gtdExecutor.createTodos({ items: ['Buy milk', 'Call mom'] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Added 2 items');
      expect(result.content).toContain('Buy milk');
      expect(result.content).toContain('Call mom');
      expect(result.state?.todos.items).toHaveLength(2);
      expect(result.state?.todos.items[0].text).toBe('Buy milk');
      expect(result.state?.todos.items[0].completed).toBe(false);
      expect(result.state?.todos.items[1].text).toBe('Call mom');
    });

    it('should append items to existing todo list', async () => {
      const ctx = createMockContext({
        todos: {
          items: [{ text: 'Existing task', completed: false }],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.createTodos({ items: ['New task'] }, ctx);

      expect(result.success).toBe(true);
      expect(result.state?.todos.items).toHaveLength(2);
      expect(result.state?.todos.items[0].text).toBe('Existing task');
      expect(result.state?.todos.items[1].text).toBe('New task');
    });

    it('should return error when no items provided', async () => {
      const ctx = createMockContext();

      const result = await gtdExecutor.createTodos({ items: [] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('No items provided');
    });

    it('should add single item with correct singular grammar', async () => {
      const ctx = createMockContext();

      const result = await gtdExecutor.createTodos({ items: ['Single task'] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Added 1 item');
      expect(result.content).not.toContain('items');
    });
  });

  describe('updateTodos', () => {
    it('should add new items via operations', async () => {
      const ctx = createMockContext({
        todos: {
          items: [{ text: 'Existing task', completed: false }],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.updateTodos(
        {
          operations: [{ type: 'add', text: 'New task' }],
        },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.state?.todos.items).toHaveLength(2);
      expect(result.state?.todos.items[1].text).toBe('New task');
    });

    it('should update item text via operations', async () => {
      const ctx = createMockContext({
        todos: {
          items: [{ text: 'Old task', completed: false }],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.updateTodos(
        {
          operations: [{ type: 'update', index: 0, newText: 'Updated task' }],
        },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.state?.todos.items[0].text).toBe('Updated task');
    });

    it('should complete items via operations', async () => {
      const ctx = createMockContext({
        todos: {
          items: [{ text: 'Task', completed: false }],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.updateTodos(
        {
          operations: [{ type: 'complete', index: 0 }],
        },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.state?.todos.items[0].completed).toBe(true);
    });

    it('should remove items via operations', async () => {
      const ctx = createMockContext({
        todos: {
          items: [
            { text: 'Task 1', completed: false },
            { text: 'Task 2', completed: false },
          ],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.updateTodos(
        {
          operations: [{ type: 'remove', index: 0 }],
        },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.state?.todos.items).toHaveLength(1);
      expect(result.state?.todos.items[0].text).toBe('Task 2');
    });

    it('should return error when no operations provided', async () => {
      const ctx = createMockContext();

      const result = await gtdExecutor.updateTodos({ operations: [] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('No operations provided');
    });
  });

  describe('completeTodos', () => {
    it('should mark items as done by indices', async () => {
      const ctx = createMockContext({
        todos: {
          items: [
            { text: 'Task 1', completed: false },
            { text: 'Task 2', completed: false },
            { text: 'Task 3', completed: false },
          ],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.completeTodos({ indices: [0, 2] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Completed 2 items');
      expect(result.state?.todos.items[0].completed).toBe(true);
      expect(result.state?.todos.items[1].completed).toBe(false);
      expect(result.state?.todos.items[2].completed).toBe(true);
    });

    it('should return error when no indices provided', async () => {
      const ctx = createMockContext();

      const result = await gtdExecutor.completeTodos({ indices: [] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('No indices provided');
    });

    it('should handle empty todo list', async () => {
      const ctx = createMockContext({
        todos: { items: [], updatedAt: '2024-01-01T00:00:00.000Z' },
      });

      const result = await gtdExecutor.completeTodos({ indices: [0] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('No todos to complete');
    });

    it('should return error when all indices are invalid', async () => {
      const ctx = createMockContext({
        todos: {
          items: [{ text: 'Task 1', completed: false }],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.completeTodos({ indices: [5, 10] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('Invalid indices');
    });

    it('should complete valid indices and warn about invalid ones', async () => {
      const ctx = createMockContext({
        todos: {
          items: [
            { text: 'Task 1', completed: false },
            { text: 'Task 2', completed: false },
          ],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.completeTodos({ indices: [0, 99] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Completed 1 item');
      expect(result.content).toContain('Ignored invalid indices');
      expect(result.state?.todos.items[0].completed).toBe(true);
      expect(result.state?.todos.items[1].completed).toBe(false);
    });

    it('should handle single item completion with correct grammar', async () => {
      const ctx = createMockContext({
        todos: {
          items: [{ text: 'Task 1', completed: false }],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.completeTodos({ indices: [0] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Completed 1 item');
      expect(result.content).not.toContain('items');
    });
  });

  describe('removeTodos', () => {
    it('should remove items by indices', async () => {
      const ctx = createMockContext({
        todos: {
          items: [
            { text: 'Task 1', completed: false },
            { text: 'Task 2', completed: false },
            { text: 'Task 3', completed: false },
          ],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.removeTodos({ indices: [0, 2] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Removed 2 items');
      expect(result.state?.todos.items).toHaveLength(1);
      expect(result.state?.todos.items[0].text).toBe('Task 2');
    });

    it('should return error when no indices provided', async () => {
      const ctx = createMockContext();

      const result = await gtdExecutor.removeTodos({ indices: [] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('No indices provided');
    });

    it('should handle empty todo list', async () => {
      const ctx = createMockContext({
        todos: { items: [], updatedAt: '2024-01-01T00:00:00.000Z' },
      });

      const result = await gtdExecutor.removeTodos({ indices: [0] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('No todos to remove');
    });
  });

  describe('clearTodos', () => {
    it('should clear all items when mode is "all"', async () => {
      const ctx = createMockContext({
        todos: {
          items: [
            { text: 'Task 1', completed: false },
            { text: 'Task 2', completed: true },
          ],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.clearTodos({ mode: 'all' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Cleared all 2 items');
      expect(result.state?.todos.items).toHaveLength(0);
    });

    it('should clear only completed items when mode is "completed"', async () => {
      const ctx = createMockContext({
        todos: {
          items: [
            { text: 'Task 1', completed: false },
            { text: 'Task 2', completed: true },
            { text: 'Task 3', completed: true },
          ],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.clearTodos({ mode: 'completed' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Cleared 2 completed items');
      expect(result.content).toContain('1 item remaining');
      expect(result.state?.todos.items).toHaveLength(1);
      expect(result.state?.todos.items[0].text).toBe('Task 1');
    });

    it('should handle empty todo list', async () => {
      const ctx = createMockContext({
        todos: { items: [], updatedAt: '2024-01-01T00:00:00.000Z' },
      });

      const result = await gtdExecutor.clearTodos({ mode: 'all' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('already empty');
    });

    it('should handle no completed items to clear', async () => {
      const ctx = createMockContext({
        todos: {
          items: [{ text: 'Task 1', completed: false }],
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      const result = await gtdExecutor.clearTodos({ mode: 'completed' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('No completed items to clear');
      expect(result.state?.todos.items).toHaveLength(1);
    });
  });

  describe('executor metadata', () => {
    it('should have correct identifier', () => {
      expect(gtdExecutor.identifier).toBe('lobe-gtd');
    });

    it('should support all MVP APIs', () => {
      expect(gtdExecutor.hasApi('createTodos')).toBe(true);
      expect(gtdExecutor.hasApi('updateTodos')).toBe(true);
      expect(gtdExecutor.hasApi('completeTodos')).toBe(true);
      expect(gtdExecutor.hasApi('removeTodos')).toBe(true);
      expect(gtdExecutor.hasApi('clearTodos')).toBe(true);
    });

    it('should not support non-MVP APIs', () => {
      expect(gtdExecutor.hasApi('createPlan')).toBe(false);
      expect(gtdExecutor.hasApi('updatePlan')).toBe(false);
    });

    it('should return correct API names', () => {
      const apiNames = gtdExecutor.getApiNames();
      expect(apiNames).toContain('createTodos');
      expect(apiNames).toContain('updateTodos');
      expect(apiNames).toContain('completeTodos');
      expect(apiNames).toContain('removeTodos');
      expect(apiNames).toContain('clearTodos');
      expect(apiNames).toHaveLength(5);
    });
  });
});
