/**
 * Lobe GTD (Getting Things Done) Executor
 *
 * Handles GTD tool calls for task management.
 * MVP: Only implements Todo functionality.
 *
 * Todo data flow:
 * - Todo items are stored in messagePlugins.state.todos
 * - The executor receives current state via ctx and returns updated state in result
 * - The framework handles persisting state to the database
 */
import type { BuiltinToolContext, BuiltinToolResult } from '@lobechat/types';
import { BaseExecutor } from '@lobechat/types';

import {
  AddTodoParams,
  ClearTodosParams,
  CompleteTodoParams,
  GTDApiName,
  GTDIdentifier,
  TodoItem,
} from './types';

// API enum for MVP (Todo only)
const GTDApiNameMVP = {
  addTodo: GTDApiName.addTodo,
  clearTodos: GTDApiName.clearTodos,
  completeTodo: GTDApiName.completeTodo,
  listTodos: GTDApiName.listTodos,
} as const;

/**
 * Helper to get todos from message plugin state
 * Handles both old format ({ todos: TodoItem[] }) and new format ({ todos: { items: TodoItem[] } })
 */
const getTodosFromState = (state: Record<string, unknown> | null | undefined): TodoItem[] => {
  if (!state) return [];

  const todos = state.todos;
  if (!todos) return [];

  // New format: { todos: { items: TodoItem[] } }
  if (typeof todos === 'object' && 'items' in (todos as Record<string, unknown>)) {
    const items = (todos as Record<string, unknown>).items;
    return Array.isArray(items) ? (items as TodoItem[]) : [];
  }

  // Old format: { todos: TodoItem[] }
  if (Array.isArray(todos)) {
    return todos as TodoItem[];
  }

  return [];
};

class GTDExecutor extends BaseExecutor<typeof GTDApiNameMVP> {
  readonly identifier = GTDIdentifier;
  protected readonly apiEnum = GTDApiNameMVP;

  // ==================== Todo APIs ====================

  /**
   * Add items to the quick todo list
   */
  addTodo = async (params: AddTodoParams, ctx: BuiltinToolContext): Promise<BuiltinToolResult> => {
    const { items } = params;

    if (!items || items.length === 0) {
      return {
        content: 'No items provided to add.',
        success: false,
      };
    }

    // Get current todos from context's plugin state (passed from framework)
    const existingTodos = getTodosFromState(ctx.pluginState);

    // Add new items
    const now = new Date().toISOString();
    const newTodos: TodoItem[] = items.map((text: string) => ({
      addedAt: now,
      done: false,
      text,
    }));

    const updatedTodos = [...existingTodos, ...newTodos];

    // Format response
    const addedList = items
      .map((item: string, i: number) => `${existingTodos.length + i + 1}. ${item}`)
      .join('\n');

    return {
      content: `Added ${items.length} item${items.length > 1 ? 's' : ''} to todo list:\n${addedList}`,
      state: {
        addedItems: items,
        todos: { items: updatedTodos, updatedAt: now },
      },
      success: true,
    };
  };

  /**
   * Mark todo items as done by their indices
   */
  completeTodo = async (
    params: CompleteTodoParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const { indices } = params;

    if (!indices || indices.length === 0) {
      return {
        content: 'No indices provided to complete.',
        success: false,
      };
    }

    const existingTodos = getTodosFromState(ctx.pluginState);

    if (existingTodos.length === 0) {
      return {
        content: 'No todos to complete. The list is empty.',
        state: {
          completedIndices: [],
          todos: { items: [], updatedAt: new Date().toISOString() },
        },
        success: true,
      };
    }

    // Validate indices
    const validIndices = indices.filter((i: number) => i >= 0 && i < existingTodos.length);
    const invalidIndices = indices.filter((i: number) => i < 0 || i >= existingTodos.length);

    if (validIndices.length === 0) {
      return {
        content: `Invalid indices: ${indices.join(', ')}. Valid range is 0-${existingTodos.length - 1}.`,
        success: false,
      };
    }

    // Mark items as done
    const updatedTodos = existingTodos.map((todo, index) => {
      if (validIndices.includes(index)) {
        return { ...todo, done: true };
      }
      return todo;
    });

    const completedItems = validIndices.map((i: number) => existingTodos[i].text);
    const now = new Date().toISOString();

    let content = `Completed ${validIndices.length} item${validIndices.length > 1 ? 's' : ''}:\n`;
    content += completedItems.map((text: string) => `- [x] ${text}`).join('\n');

    if (invalidIndices.length > 0) {
      content += `\n\nNote: Ignored invalid indices: ${invalidIndices.join(', ')}`;
    }

    return {
      content,
      state: {
        completedIndices: validIndices,
        todos: { items: updatedTodos, updatedAt: now },
      },
      success: true,
    };
  };

  /**
   * Clear todo items
   */
  clearTodos = async (
    params: ClearTodosParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const { mode } = params;

    const existingTodos = getTodosFromState(ctx.pluginState);

    if (existingTodos.length === 0) {
      return {
        content: 'Todo list is already empty.',
        state: {
          clearedCount: 0,
          mode,
          todos: { items: [], updatedAt: new Date().toISOString() },
        },
        success: true,
      };
    }

    let updatedTodos: TodoItem[];
    let clearedCount: number;
    let content: string;

    if (mode === 'all') {
      clearedCount = existingTodos.length;
      updatedTodos = [];
      content = `Cleared all ${clearedCount} item${clearedCount > 1 ? 's' : ''} from todo list.`;
    } else {
      // mode === 'completed'
      updatedTodos = existingTodos.filter((todo) => !todo.done);
      clearedCount = existingTodos.length - updatedTodos.length;

      if (clearedCount === 0) {
        content = 'No completed items to clear.';
      } else {
        content = `Cleared ${clearedCount} completed item${clearedCount > 1 ? 's' : ''}. ${updatedTodos.length} item${updatedTodos.length !== 1 ? 's' : ''} remaining.`;
      }
    }

    const now = new Date().toISOString();

    return {
      content,
      state: {
        clearedCount,
        mode,
        todos: { items: updatedTodos, updatedAt: now },
      },
      success: true,
    };
  };

  /**
   * List all current todo items with their completion status
   */
  listTodos = async (_params: unknown, ctx: BuiltinToolContext): Promise<BuiltinToolResult> => {
    const todos = getTodosFromState(ctx.pluginState);
    const now = new Date().toISOString();

    if (todos.length === 0) {
      return {
        content: 'Todo list is empty.',
        state: { todos: { items: [], updatedAt: now } },
        success: true,
      };
    }

    const completedCount = todos.filter((t) => t.done).length;
    const pendingCount = todos.length - completedCount;

    // Format todo list
    const todoList = todos
      .map((todo, index) => {
        const checkbox = todo.done ? '[x]' : '[ ]';
        return `${index}. ${checkbox} ${todo.text}`;
      })
      .join('\n');

    const summary = `Total: ${todos.length} | Pending: ${pendingCount} | Completed: ${completedCount}`;

    return {
      content: `${summary}\n\n${todoList}`,
      state: { todos: { items: todos, updatedAt: now } },
      success: true,
    };
  };
}

// Export the executor instance for registration
export const gtdExecutor = new GTDExecutor();
