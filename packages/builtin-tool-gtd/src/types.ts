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
  
  
  // /** Get the current plan */
// getPlan: 'getPlan',
// ==================== Task Management (Coming Soon) ====================
// /** Create a new task */
// createTask: 'createTask',
// /** Update an existing task */
// updateTask: 'updateTask',
// /** Delete a task */
// deleteTask: 'deleteTask',
// /** List all tasks with optional filters */
// listTasks: 'listTasks',
// /** Get task details */
// getTask: 'getTask',
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

  
  

/** List current todos */
listTodos: 'listTodos',

  
  /** Update an existing plan */
updatePlan: 'updatePlan',
} as const;

export type GTDApiNameType = (typeof GTDApiName)[keyof typeof GTDApiName];

// ==================== Task Status (Coming Soon) ====================

// export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

// export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

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

// export interface GetPlanParams {
//   /** Plan ID to retrieve */
//   planId?: string;
// }

// ==================== Task Params (Coming Soon) ====================

// export interface CreateTaskParams {
//   /** Task title */
//   title: string;
//   /** Task description */
//   description?: string;
//   /** Task priority */
//   priority?: TaskPriority;
//   /** Tags for categorization */
//   tags?: string[];
//   /** Due date in ISO format */
//   dueDate?: string;
//   /** Parent task ID for subtasks */
//   parentId?: string;
//   /** Associated plan ID */
//   planId?: string;
//   /** Assigned agent ID */
//   assignee?: string;
// }

// export interface UpdateTaskParams {
//   /** Task ID to update */
//   taskId: string;
//   /** Updated title */
//   title?: string;
//   /** Updated description */
//   description?: string;
//   /** Updated status */
//   status?: TaskStatus;
//   /** Updated priority */
//   priority?: TaskPriority;
//   /** Updated tags */
//   tags?: string[];
//   /** Updated due date */
//   dueDate?: string;
//   /** Progress note */
//   note?: string;
// }

// export interface DeleteTaskParams {
//   /** Task ID to delete */
//   taskId: string;
// }

// export interface ListTasksParams {
//   /** Filter by status */
//   status?: TaskStatus | TaskStatus[];
//   /** Filter by priority */
//   priority?: TaskPriority | TaskPriority[];
//   /** Filter by tags */
//   tags?: string[];
//   /** Filter by assignee */
//   assignee?: string;
//   /** Filter by plan ID */
//   planId?: string;
//   /** Maximum results */
//   limit?: number;
// }

// export interface GetTaskParams {
//   /** Task ID to retrieve */
//   taskId: string;
// }

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

// export interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   status: TaskStatus;
//   priority: TaskPriority;
//   tags: string[];
//   dueDate?: string;
//   parentId?: string;
//   planId?: string;
//   assignee?: string;
//   notes: string[];
//   createdAt: string;
//   updatedAt: string;
// }

export interface TodoItem {
  addedAt: string;
  done: boolean;
  text: string;
}

export interface TodoList {
  items: TodoItem[];
  updatedAt: string;
}

// ==================== State Types for Render ====================

export interface AddTodoState {
  /** Items that were added */
  addedItems: string[];
  /** Current todo list after addition */
  todos: TodoList;
}

export interface CompleteTodoState {
  /** Indices that were completed */
  completedIndices: number[];
  /** Current todo list after completion */
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

export interface ListTodosState {
  /** Current todo list */
  todos: TodoList;
}
