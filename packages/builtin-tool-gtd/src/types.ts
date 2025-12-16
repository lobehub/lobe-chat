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
  completeTodo: 'completeTodo',

  /** Create new todo items */
  createTodo: 'createTodo',

  /** Remove todo items by indices */
  removeTodo: 'removeTodo',

  /** Update todo list (supports batch operations: modify text, complete, remove) */
  updateTodo: 'updateTodo',

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
export interface CreateTodoParams {
  /** Array of todo item texts to create */
  items: string[];
}

/**
 * Update todo list with batch operations
 * Supports: modify text, mark completed, remove items
 */
export interface UpdateTodoParams {
  /** Complete items list after update */
  items: TodoItem[];
}

/**
 * Mark todo items as completed by indices
 */
export interface CompleteTodoParams {
  /** Indices of items to mark as completed (0-based) */
  indices: number[];
}

/**
 * Remove todo items by indices
 */
export interface RemoveTodoParams {
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

export interface CreateTodoState {
  /** Items that were created */
  createdItems: string[];
  /** Current todo list after creation */
  todos: TodoList;
}

export interface UpdateTodoState {
  /** Current todo list after update */
  todos: TodoList;
}

export interface CompleteTodoState {
  /** Indices that were completed */
  completedIndices: number[];
  /** Current todo list after completion */
  todos: TodoList;
}

export interface RemoveTodoState {
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

export interface PlanStep {
  /** Assigned agent ID (for multi-agent scenarios) */
  assignee?: string;
  /** Dependencies on other steps (by index) */
  dependsOn?: number[];
  /** Step description */
  description: string;
  /** Estimated effort (optional) */
  effort?: 'small' | 'medium' | 'large';
}

export interface CreatePlanParams {
  /** Additional context or constraints */
  context?: string;
  /** The goal to plan for */
  goal: string;
  /** Breakdown the goal into steps */
  steps: PlanStep[];
}

export interface UpdatePlanParams {
  /** Mark plan as completed */
  completed?: boolean;
  /** Updated goal */
  goal?: string;
  /** Plan ID to update */
  planId: string;
  /** Updated steps */
  steps?: PlanStep[];
}

// ==================== Plan Result Types ====================

export interface Plan {
  completed: boolean;
  createdAt: string;
  goal: string;
  id: string;
  steps: PlanStep[];
  updatedAt: string;
}
