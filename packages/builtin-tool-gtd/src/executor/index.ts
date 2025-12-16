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
import { BaseExecutor, type BuiltinToolContext, type BuiltinToolResult } from '@lobechat/types';

import { GTDIdentifier } from '../manifest';
import {
  type ClearTodosParams,
  type CompleteTodosParams,
  type CreateTodosParams,
  GTDApiName,
  type RemoveTodosParams,
  type TodoItem,
  type UpdateTodosParams,
} from '../types';

// API enum for MVP (Todo only)
const GTDApiNameMVP = {
  clearTodos: GTDApiName.clearTodos,
  completeTodos: GTDApiName.completeTodos,
  createTodos: GTDApiName.createTodos,
  removeTodos: GTDApiName.removeTodos,
  updateTodos: GTDApiName.updateTodos,
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

/**
 * GTD Tool Executor
 */
class GTDExecutor extends BaseExecutor<typeof GTDApiNameMVP> {
  readonly identifier = GTDIdentifier;
  protected readonly apiEnum = GTDApiNameMVP;

  // ==================== Todo APIs ====================

  /**
   * Create new todo items
   */
  createTodos = async (
    params: CreateTodosParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
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
      completed: false,
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
        createdItems: items,
        todos: { items: updatedTodos, updatedAt: now },
      },
      success: true,
    };
  };

  /**
   * Update todo items with batch operations
   */
  updateTodos = async (
    params: UpdateTodosParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const { operations } = params;

    if (!operations || operations.length === 0) {
      return {
        content: 'No operations provided.',
        success: false,
      };
    }

    const existingTodos = getTodosFromState(ctx.pluginState);
    let updatedTodos = [...existingTodos];
    const results: string[] = [];

    for (const op of operations) {
      switch (op.type) {
        case 'add': {
          if (op.text) {
            updatedTodos.push({ completed: false, text: op.text });
            results.push(`Added: "${op.text}"`);
          }
          break;
        }
        case 'update': {
          if (op.index !== undefined && op.index >= 0 && op.index < updatedTodos.length) {
            const item = updatedTodos[op.index];
            if (op.newText !== undefined) {
              item.text = op.newText;
            }
            if (op.completed !== undefined) {
              item.completed = op.completed;
            }
            results.push(`Updated item ${op.index + 1}`);
          }
          break;
        }
        case 'remove': {
          if (op.index !== undefined && op.index >= 0 && op.index < updatedTodos.length) {
            const removed = updatedTodos.splice(op.index, 1)[0];
            results.push(`Removed: "${removed.text}"`);
          }
          break;
        }
        case 'complete': {
          if (op.index !== undefined && op.index >= 0 && op.index < updatedTodos.length) {
            updatedTodos[op.index].completed = true;
            results.push(`Completed: "${updatedTodos[op.index].text}"`);
          }
          break;
        }
      }
    }

    const now = new Date().toISOString();

    return {
      content:
        results.length > 0
          ? `Applied ${results.length} operation${results.length > 1 ? 's' : ''}:\n${results.join('\n')}`
          : 'No operations applied.',
      state: {
        todos: { items: updatedTodos, updatedAt: now },
      },
      success: true,
    };
  };

  /**
   * Mark todo items as done by their indices
   */
  completeTodos = async (
    params: CompleteTodosParams,
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

    // Mark items as completed
    const updatedTodos = existingTodos.map((todo, index) => {
      if (validIndices.includes(index)) {
        return { ...todo, completed: true };
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
   * Remove todo items by indices
   */
  removeTodos = async (
    params: RemoveTodosParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const { indices } = params;

    if (!indices || indices.length === 0) {
      return {
        content: 'No indices provided to remove.',
        success: false,
      };
    }

    const existingTodos = getTodosFromState(ctx.pluginState);

    if (existingTodos.length === 0) {
      return {
        content: 'No todos to remove. The list is empty.',
        state: {
          removedIndices: [],
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

    // Remove items
    const removedItems = validIndices.map((i: number) => existingTodos[i].text);
    const updatedTodos = existingTodos.filter((_, index) => !validIndices.includes(index));
    const now = new Date().toISOString();

    let content = `Removed ${validIndices.length} item${validIndices.length > 1 ? 's' : ''}:\n`;
    content += removedItems.map((text: string) => `- ${text}`).join('\n');

    if (invalidIndices.length > 0) {
      content += `\n\nNote: Ignored invalid indices: ${invalidIndices.join(', ')}`;
    }

    return {
      content,
      state: {
        removedIndices: validIndices,
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
      updatedTodos = existingTodos.filter((todo) => !todo.completed);
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
}

// Export the executor instance for registration
export const gtdExecutor = new GTDExecutor();
