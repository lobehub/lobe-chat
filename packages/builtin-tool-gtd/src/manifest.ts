import type { BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';
import { GTDApiName } from './types';

export const GTDIdentifier = 'lobe-gtd';

export const GTDManifest: BuiltinToolManifest = {
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  api: [
    // ==================== Planning ====================
    {
      description:
        'Create a structured plan by breaking down a goal into actionable steps. Use this when the user has a complex goal that needs to be decomposed into manageable pieces.',
      name: GTDApiName.createPlan,
      parameters: {
        properties: {
          goal: {
            description: 'The main goal or objective to plan for.',
            type: 'string',
          },
          context: {
            description:
              'Additional context, constraints, or background information relevant to the planning.',
            type: 'string',
          },
          steps: {
            description: 'Array of steps to achieve the goal.',
            items: {
              properties: {
                description: {
                  description: 'Clear description of what needs to be done in this step.',
                  type: 'string',
                },
                dependsOn: {
                  description:
                    'Array of step indices (0-based) that must be completed before this step.',
                  items: { type: 'number' },
                  type: 'array',
                },
                effort: {
                  description: 'Estimated effort level for this step.',
                  enum: ['small', 'medium', 'large'],
                  type: 'string',
                },
                assignee: {
                  description: 'Agent ID to assign this step to (for multi-agent scenarios).',
                  type: 'string',
                },
              },
              required: ['description'],
              type: 'object',
            },
            type: 'array',
          },
        },
        required: ['goal', 'steps'],
        type: 'object',
      },
    },
    {
      description:
        'Update an existing plan. Use this to modify steps, mark as completed, or adjust the goal.',
      name: GTDApiName.updatePlan,
      parameters: {
        properties: {
          planId: {
            description: 'The ID of the plan to update.',
            type: 'string',
          },
          goal: {
            description: 'Updated goal description.',
            type: 'string',
          },
          steps: {
            description: 'Updated array of steps.',
            items: {
              properties: {
                description: { type: 'string' },
                dependsOn: { items: { type: 'number' }, type: 'array' },
                effort: { enum: ['small', 'medium', 'large'], type: 'string' },
                assignee: { type: 'string' },
              },
              required: ['description'],
              type: 'object',
            },
            type: 'array',
          },
          completed: {
            description: 'Mark the plan as completed.',
            type: 'boolean',
          },
        },
        required: ['planId'],
        type: 'object',
      },
    },
    // {
    //   description: 'Get the current plan or a specific plan by ID.',
    //   name: GTDApiName.getPlan,
    //   parameters: {
    //     properties: {
    //       planId: {
    //         description: 'The ID of the plan to retrieve. If omitted, returns the active plan.',
    //         type: 'string',
    //       },
    //     },
    //     required: [],
    //     type: 'object',
    //   },
    // },

    // ==================== Task Management (Coming Soon) ====================
    // {
    //   description:
    //     'Create a new task. Tasks are actionable items that can be tracked, prioritized, and organized with tags.',
    //   name: GTDApiName.createTask,
    //   parameters: {
    //     properties: {
    //       title: {
    //         description: 'Clear, actionable title for the task.',
    //         type: 'string',
    //       },
    //       description: {
    //         description: 'Detailed description of what needs to be done.',
    //         type: 'string',
    //       },
    //       priority: {
    //         description: 'Task priority level.',
    //         enum: ['urgent', 'high', 'normal', 'low'],
    //         type: 'string',
    //       },
    //       tags: {
    //         description: 'Tags for categorizing and filtering tasks.',
    //         items: { type: 'string' },
    //         type: 'array',
    //       },
    //       dueDate: {
    //         description: 'Due date in ISO 8601 format (e.g., "2024-12-31").',
    //         type: 'string',
    //       },
    //       parentId: {
    //         description: 'Parent task ID to create a subtask.',
    //         type: 'string',
    //       },
    //       planId: {
    //         description: 'Associated plan ID to link this task to a plan.',
    //         type: 'string',
    //       },
    //       assignee: {
    //         description: 'Agent ID to assign this task to.',
    //         type: 'string',
    //       },
    //     },
    //     required: ['title'],
    //     type: 'object',
    //   },
    // },
    // {
    //   description:
    //     'Update an existing task. Use this to change status, add notes, or modify task details.',
    //   name: GTDApiName.updateTask,
    //   parameters: {
    //     properties: {
    //       taskId: {
    //         description: 'The ID of the task to update.',
    //         type: 'string',
    //       },
    //       title: {
    //         description: 'Updated task title.',
    //         type: 'string',
    //       },
    //       description: {
    //         description: 'Updated description.',
    //         type: 'string',
    //       },
    //       status: {
    //         description: 'Updated task status.',
    //         enum: ['pending', 'in_progress', 'completed', 'blocked', 'cancelled'],
    //         type: 'string',
    //       },
    //       priority: {
    //         description: 'Updated priority.',
    //         enum: ['urgent', 'high', 'normal', 'low'],
    //         type: 'string',
    //       },
    //       tags: {
    //         description: 'Updated tags (replaces existing tags).',
    //         items: { type: 'string' },
    //         type: 'array',
    //       },
    //       dueDate: {
    //         description: 'Updated due date.',
    //         type: 'string',
    //       },
    //       note: {
    //         description: 'Add a progress note to the task.',
    //         type: 'string',
    //       },
    //     },
    //     required: ['taskId'],
    //     type: 'object',
    //   },
    // },
    // {
    //   description: 'Delete a task.',
    //   name: GTDApiName.deleteTask,
    //   parameters: {
    //     properties: {
    //       taskId: {
    //         description: 'The ID of the task to delete.',
    //         type: 'string',
    //       },
    //     },
    //     required: ['taskId'],
    //     type: 'object',
    //   },
    // },
    // {
    //   description:
    //     'List tasks with optional filters. Use this to view tasks by status, priority, tags, or assignee.',
    //   name: GTDApiName.listTasks,
    //   parameters: {
    //     properties: {
    //       status: {
    //         description: 'Filter by status. Can be a single status or array of statuses.',
    //         oneOf: [
    //           {
    //             enum: ['pending', 'in_progress', 'completed', 'blocked', 'cancelled'],
    //             type: 'string',
    //           },
    //           {
    //             items: {
    //               enum: ['pending', 'in_progress', 'completed', 'blocked', 'cancelled'],
    //               type: 'string',
    //             },
    //             type: 'array',
    //           },
    //         ],
    //       },
    //       priority: {
    //         description: 'Filter by priority. Can be a single priority or array.',
    //         oneOf: [
    //           { enum: ['urgent', 'high', 'normal', 'low'], type: 'string' },
    //           {
    //             items: { enum: ['urgent', 'high', 'normal', 'low'], type: 'string' },
    //             type: 'array',
    //           },
    //         ],
    //       },
    //       tags: {
    //         description: 'Filter by tags. Returns tasks that have any of the specified tags.',
    //         items: { type: 'string' },
    //         type: 'array',
    //       },
    //       assignee: {
    //         description: 'Filter by assigned agent ID.',
    //         type: 'string',
    //       },
    //       planId: {
    //         description: 'Filter by associated plan ID.',
    //         type: 'string',
    //       },
    //       limit: {
    //         default: 20,
    //         description: 'Maximum number of tasks to return.',
    //         maximum: 100,
    //         minimum: 1,
    //         type: 'number',
    //       },
    //     },
    //     required: [],
    //     type: 'object',
    //   },
    // },
    // {
    //   description: 'Get detailed information about a specific task.',
    //   name: GTDApiName.getTask,
    //   parameters: {
    //     properties: {
    //       taskId: {
    //         description: 'The ID of the task to retrieve.',
    //         type: 'string',
    //       },
    //     },
    //     required: ['taskId'],
    //     type: 'object',
    //   },
    // },

    // ==================== Quick Todo ====================
    {
      description:
        'Add items to the quick todo list. This is a lightweight, session-scoped list for quick capture of action items.',
      name: GTDApiName.addTodo,
      humanIntervention: 'always',
      parameters: {
        properties: {
          items: {
            description: 'Array of todo items to add.',
            items: { type: 'string' },
            type: 'array',
          },
        },
        required: ['items'],
        type: 'object',
      },
    },
    {
      description: 'Mark todo items as done by their indices.',
      name: GTDApiName.completeTodo,
      parameters: {
        properties: {
          indices: {
            description: 'Array of item indices (0-based) to mark as completed.',
            items: { type: 'number' },
            type: 'array',
          },
        },
        required: ['indices'],
        type: 'object',
      },
    },
    {
      description: 'Clear todo items. Can clear only completed items or all items.',
      name: GTDApiName.clearTodos,
      humanIntervention: 'always',
      parameters: {
        properties: {
          mode: {
            description: '"completed" clears only done items, "all" clears the entire list.',
            enum: ['completed', 'all'],
            type: 'string',
          },
        },
        required: ['mode'],
        type: 'object',
      },
    },
    {
      description: 'List all current todo items with their completion status.',
      name: GTDApiName.listTodos,
      parameters: {
        properties: {},
        required: [],
        type: 'object',
      },
    },
  ],
  identifier: GTDIdentifier,
  meta: {
    avatar: '✅',
    description: 'Plan goals and track progress with GTD methodology',
    title: 'GTD Tools',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};

export { GTDApiName } from './types';
