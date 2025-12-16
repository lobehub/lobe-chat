import { describe, expect, it } from 'vitest';

import type { BuiltinToolContext } from '../../types';
import { gtd } from '../lobe-gtd';

describe('GTDExecutor', () => {
  const createMockContext = (pluginState?: Record<string, unknown>): BuiltinToolContext => ({
    messageId: 'test-message-id',
    operationId: 'test-operation-id',
    pluginState,
  });

  describe('addTodo', () => {
    it('should add items to empty todo list', async () => {
      const ctx = createMockContext();

      const result = await gtd.addTodo({ items: ['Buy milk', 'Call mom'] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Added 2 items');
      expect(result.content).toContain('Buy milk');
      expect(result.content).toContain('Call mom');
      expect(result.state?.todos).toHaveLength(2);
      expect(result.state?.todos[0].text).toBe('Buy milk');
      expect(result.state?.todos[0].done).toBe(false);
      expect(result.state?.todos[1].text).toBe('Call mom');
    });

    it('should append items to existing todo list', async () => {
      const ctx = createMockContext({
        todos: [{ text: 'Existing task', done: false, addedAt: '2024-01-01T00:00:00.000Z' }],
      });

      const result = await gtd.addTodo({ items: ['New task'] }, ctx);

      expect(result.success).toBe(true);
      expect(result.state?.todos).toHaveLength(2);
      expect(result.state?.todos[0].text).toBe('Existing task');
      expect(result.state?.todos[1].text).toBe('New task');
    });

    it('should return error when no items provided', async () => {
      const ctx = createMockContext();

      const result = await gtd.addTodo({ items: [] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('No items provided');
    });

    it('should add single item with correct singular grammar', async () => {
      const ctx = createMockContext();

      const result = await gtd.addTodo({ items: ['Single task'] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Added 1 item');
      expect(result.content).not.toContain('items');
    });
  });

  describe('completeTodo', () => {
    it('should mark items as done by indices', async () => {
      const ctx = createMockContext({
        todos: [
          { text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 2', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 3', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
        ],
      });

      const result = await gtd.completeTodo({ indices: [0, 2] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Completed 2 items');
      expect(result.state?.todos[0].done).toBe(true);
      expect(result.state?.todos[1].done).toBe(false);
      expect(result.state?.todos[2].done).toBe(true);
    });

    it('should return error when no indices provided', async () => {
      const ctx = createMockContext();

      const result = await gtd.completeTodo({ indices: [] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('No indices provided');
    });

    it('should handle empty todo list', async () => {
      const ctx = createMockContext({ todos: [] });

      const result = await gtd.completeTodo({ indices: [0] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('No todos to complete');
    });

    it('should return error when all indices are invalid', async () => {
      const ctx = createMockContext({
        todos: [{ text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' }],
      });

      const result = await gtd.completeTodo({ indices: [5, 10] }, ctx);

      expect(result.success).toBe(false);
      expect(result.content).toContain('Invalid indices');
    });

    it('should complete valid indices and warn about invalid ones', async () => {
      const ctx = createMockContext({
        todos: [
          { text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 2', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
        ],
      });

      const result = await gtd.completeTodo({ indices: [0, 99] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Completed 1 item');
      expect(result.content).toContain('Ignored invalid indices');
      expect(result.state?.todos[0].done).toBe(true);
      expect(result.state?.todos[1].done).toBe(false);
    });

    it('should handle single item completion with correct grammar', async () => {
      const ctx = createMockContext({
        todos: [{ text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' }],
      });

      const result = await gtd.completeTodo({ indices: [0] }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Completed 1 item');
      expect(result.content).not.toContain('items');
    });
  });

  describe('clearTodos', () => {
    it('should clear all items when mode is "all"', async () => {
      const ctx = createMockContext({
        todos: [
          { text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 2', done: true, addedAt: '2024-01-01T00:00:00.000Z' },
        ],
      });

      const result = await gtd.clearTodos({ mode: 'all' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Cleared all 2 items');
      expect(result.state?.todos).toHaveLength(0);
    });

    it('should clear only completed items when mode is "completed"', async () => {
      const ctx = createMockContext({
        todos: [
          { text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 2', done: true, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 3', done: true, addedAt: '2024-01-01T00:00:00.000Z' },
        ],
      });

      const result = await gtd.clearTodos({ mode: 'completed' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Cleared 2 completed items');
      expect(result.content).toContain('1 item remaining');
      expect(result.state?.todos).toHaveLength(1);
      expect(result.state?.todos[0].text).toBe('Task 1');
    });

    it('should handle empty todo list', async () => {
      const ctx = createMockContext({ todos: [] });

      const result = await gtd.clearTodos({ mode: 'all' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('already empty');
    });

    it('should handle no completed items to clear', async () => {
      const ctx = createMockContext({
        todos: [{ text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' }],
      });

      const result = await gtd.clearTodos({ mode: 'completed' }, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('No completed items to clear');
      expect(result.state?.todos).toHaveLength(1);
    });
  });

  describe('listTodos', () => {
    it('should list all todos with status', async () => {
      const ctx = createMockContext({
        todos: [
          { text: 'Task 1', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 2', done: true, addedAt: '2024-01-01T00:00:00.000Z' },
          { text: 'Task 3', done: false, addedAt: '2024-01-01T00:00:00.000Z' },
        ],
      });

      const result = await gtd.listTodos({}, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Total: 3');
      expect(result.content).toContain('Pending: 2');
      expect(result.content).toContain('Completed: 1');
      expect(result.content).toContain('0. [ ] Task 1');
      expect(result.content).toContain('1. [x] Task 2');
      expect(result.content).toContain('2. [ ] Task 3');
    });

    it('should handle empty todo list', async () => {
      const ctx = createMockContext({ todos: [] });

      const result = await gtd.listTodos({}, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('empty');
    });

    it('should handle undefined plugin state', async () => {
      const ctx = createMockContext();

      const result = await gtd.listTodos({}, ctx);

      expect(result.success).toBe(true);
      expect(result.content).toContain('empty');
    });
  });

  describe('executor metadata', () => {
    it('should have correct identifier', () => {
      expect(gtd.identifier).toBe('lobe-gtd');
    });

    it('should support all MVP APIs', () => {
      expect(gtd.hasApi('addTodo')).toBe(true);
      expect(gtd.hasApi('completeTodo')).toBe(true);
      expect(gtd.hasApi('clearTodos')).toBe(true);
      expect(gtd.hasApi('listTodos')).toBe(true);
    });

    it('should not support non-MVP APIs', () => {
      expect(gtd.hasApi('createPlan')).toBe(false);
      expect(gtd.hasApi('createTask')).toBe(false);
    });

    it('should return correct API names', () => {
      const apiNames = gtd.getApiNames();
      expect(apiNames).toContain('addTodo');
      expect(apiNames).toContain('completeTodo');
      expect(apiNames).toContain('clearTodos');
      expect(apiNames).toContain('listTodos');
      expect(apiNames).toHaveLength(4);
    });
  });
});
