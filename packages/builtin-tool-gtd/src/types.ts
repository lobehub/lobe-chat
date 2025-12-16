/**
 * API names for GTD (Getting Things Done) tool
 *
 * GTD Tools help users and agents manage tasks effectively.
 * These tools can be used by:
 * - LobeAI default assistant for user task management
 * - Group Supervisor for multi-agent task orchestration
 *
 * MVP version focuses on Plan and Todo functionality.
 * Task management will be added in future iterations.
 */
export const GTDApiName = {
  // ==================== Quick Todo ====================
  /** Clear completed or all todos */
  clearTodos: 'clearTodos',

  /** Mark todo items as done by indices */
  completeTodos: 'completeTodos',

  /** Create new todo items */
  createTodos: 'createTodos',

  /** Remove todo items by indices */
  removeTodos: 'removeTodos',

  /** Update todo items with batch operations (add, update, remove, complete) */
  updateTodos: 'updateTodos',

  // ==================== Planning ====================
  /** Create a structured plan by breaking down a goal into actionable steps */
  createPlan: 'createPlan',

  /** Update an existing plan */
  updatePlan: 'updatePlan',
} as const;

export type GTDApiNameType = (typeof GTDApiName)[keyof typeof GTDApiName];

// ==================== Todo Item ====================

export interface TodoItem {
  /** Whether the item is completed */
  completed: boolean;
  /** The todo item text */
  text: string;
}

export interface TodoList {
  items: TodoItem[];
  updatedAt: string;
}

// ==================== Todo Params ====================

/**
 * Create new todo items
 * AI passes text[], application layer converts to TodoItem[]
 */
export interface CreateTodosParams {
  /** Array of todo item texts to create */
  items: string[];
}

/**
 * Update operation types for batch updates
 */
export type TodoUpdateOperationType = 'add' | 'update' | 'remove' | 'complete';

/**
 * Single update operation
 */
export interface TodoUpdateOperation {
  /** Operation type */
  type: TodoUpdateOperationType;
  /** For 'add': the text to add */
  text?: string;
  /** For 'update', 'remove', 'complete': the index of the item (0-based) */
  index?: number;
  /** For 'update': the new text */
  newText?: string;
  /** For 'update': the new completed status */
  completed?: boolean;
}

/**
 * Update todo list with batch operations
 * Supports: add, update, remove, complete
 */
export interface UpdateTodosParams {
  /** Array of update operations to apply */
  operations: TodoUpdateOperation[];
}

/**
 * Mark todo items as completed by indices
 */
export interface CompleteTodosParams {
  /** Indices of items to mark as completed (0-based) */
  indices: number[];
}

/**
 * Remove todo items by indices
 */
export interface RemoveTodosParams {
  /** Indices of items to remove (0-based) */
  indices: number[];
}

/**
 * Clear todo items
 */
export interface ClearTodosParams {
  /** Clear mode: 'completed' only clears done items, 'all' clears everything */
  mode: 'completed' | 'all';
}

// ==================== Todo State Types for Render ====================

export interface CreateTodosState {
  /** Items that were created */
  createdItems: string[];
  /** Current todo list after creation */
  todos: TodoList;
}

export interface UpdateTodosState {
  /** Operations that were applied */
  appliedOperations: TodoUpdateOperation[];
  /** Current todo list after update */
  todos: TodoList;
}

export interface CompleteTodosState {
  /** Indices that were completed */
  completedIndices: number[];
  /** Current todo list after completion */
  todos: TodoList;
}

export interface RemoveTodosState {
  /** Indices that were removed */
  removedIndices: number[];
  /** Current todo list after removal */
  todos: TodoList;
}

export interface ClearTodosState {
  /** Number of items cleared */
  clearedCount: number;
  /** Mode used for clearing */
  mode: 'completed' | 'all';
  /** Current todo list after clearing */
  todos: TodoList;
}

// ==================== Planning Params ====================

/**
 * Create a high-level plan document
 * Plans define the strategic direction (what and why), not actionable steps
 */
export interface CreatePlanParams {
  /** Additional context, constraints, or strategic considerations */
  context?: string;
  /** The main goal or objective to achieve */
  goal: string;
}

export interface UpdatePlanParams {
  /** Mark plan as completed */
  completed?: boolean;
  /** Updated context information */
  context?: string;
  /** Updated goal */
  goal?: string;
  /** Plan ID to update */
  planId: string;
}

// ==================== Plan Result Types ====================

/**
 * A high-level plan document
 * Contains goal and context, but no steps (steps are managed via Todos)
 */
export interface Plan {
  /** Whether the plan is completed */
  completed: boolean;
  /** Additional context and strategic information */
  context?: string;
  /** Creation timestamp */
  createdAt: string;
  /** The main goal or objective */
  goal: string;
  /** Unique plan identifier */
  id: string;
  /** Last update timestamp */
  updatedAt: string;
}
