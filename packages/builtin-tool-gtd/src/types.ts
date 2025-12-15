/**
 * API names for GTD (Getting Things Done) tool
 *
 * GTD Tools help users and agents manage tasks effectively.
 * These tools can be used by:
 * - LobeAI default assistant for user task management
 * - Group Supervisor for multi-agent task orchestration
 */
export const GTDApiName = {
  // ==================== Quick Todo ====================
  /** Add items to the quick todo list */
  addTodo: 'addTodo',

  /** Clear completed or all todos */
  clearTodos: 'clearTodos',

  /** Mark todo items as done */
  completeTodo: 'completeTodo',

  // ==================== Planning ====================
  /** Create a structured plan by breaking down a goal into actionable steps */
  createPlan: 'createPlan',

  // ==================== Task Management ====================
  /** Create a new task */
  createTask: 'createTask',

  /** Delete a task */
  deleteTask: 'deleteTask',

  /** Get the current plan */
  getPlan: 'getPlan',

  /** Get task details */
  getTask: 'getTask',

  /** List all tasks with optional filters */
  listTasks: 'listTasks',

  /** List current todos */
  listTodos: 'listTodos',

  /** Update an existing plan */
  updatePlan: 'updatePlan',

  /** Update an existing task */
  updateTask: 'updateTask',
} as const;

export type GTDApiNameType = (typeof GTDApiName)[keyof typeof GTDApiName];

// ==================== Task Status ====================

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

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

export interface GetPlanParams {
  /** Plan ID to retrieve */
  planId?: string;
}

// ==================== Task Params ====================

export interface CreateTaskParams {
  /** Assigned agent ID */
  assignee?: string;
  /** Task description */
  description?: string;
  /** Due date in ISO format */
  dueDate?: string;
  /** Parent task ID for subtasks */
  parentId?: string;
  /** Associated plan ID */
  planId?: string;
  /** Task priority */
  priority?: TaskPriority;
  /** Tags for categorization */
  tags?: string[];
  /** Task title */
  title: string;
}

export interface UpdateTaskParams {
  /** Updated description */
  description?: string;
  /** Updated due date */
  dueDate?: string;
  /** Progress note */
  note?: string;
  /** Updated priority */
  priority?: TaskPriority;
  /** Updated status */
  status?: TaskStatus;
  /** Updated tags */
  tags?: string[];
  /** Task ID to update */
  taskId: string;
  /** Updated title */
  title?: string;
}

export interface DeleteTaskParams {
  /** Task ID to delete */
  taskId: string;
}

export interface ListTasksParams {
  /** Filter by assignee */
  assignee?: string;
  /** Maximum results */
  limit?: number;
  /** Filter by plan ID */
  planId?: string;
  /** Filter by priority */
  priority?: TaskPriority | TaskPriority[];
  /** Filter by status */
  status?: TaskStatus | TaskStatus[];
  /** Filter by tags */
  tags?: string[];
}

export interface GetTaskParams {
  /** Task ID to retrieve */
  taskId: string;
}

// ==================== Todo Params ====================

export interface AddTodoParams {
  /** Todo items to add */
  items: string[];
}

export interface CompleteTodoParams {
  /** Indices of items to mark as done (0-based) */
  indices: number[];
}

export interface ClearTodosParams {
  /** Clear mode: 'completed' only clears done items, 'all' clears everything */
  mode: 'completed' | 'all';
}

// ==================== Result Types ====================

export interface Plan {
  completed: boolean;
  createdAt: string;
  goal: string;
  id: string;
  steps: PlanStep[];
  updatedAt: string;
}

export interface Task {
  assignee?: string;
  createdAt: string;
  description?: string;
  dueDate?: string;
  id: string;
  notes: string[];
  parentId?: string;
  planId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  title: string;
  updatedAt: string;
}

export interface TodoItem {
  addedAt: string;
  done: boolean;
  text: string;
}

export interface TodoList {
  items: TodoItem[];
  updatedAt: string;
}
