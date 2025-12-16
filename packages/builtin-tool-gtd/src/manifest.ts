import type { BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';
import { GTDApiName } from './types';

export const GTDIdentifier = 'lobe-gtd';

export const GTDManifest: BuiltinToolManifest = {
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  api: [
    // ==================== Quick Todo ====================
    {
      description: 'Create new todo items. Pass an array of text strings.',
      name: GTDApiName.createTodos,
      humanIntervention: 'always',
      parameters: {
        properties: {
          items: {
            description: 'Array of todo item texts to create.',
            items: { type: 'string' },
            type: 'array',
          },
        },
        required: ['items'],
        type: 'object',
      },
    },
    {
      description:
        'Update todo items with batch operations. Each operation specifies a type (add, update, remove, complete) and the relevant data.',
      name: GTDApiName.updateTodos,
      parameters: {
        properties: {
          operations: {
            description: 'Array of update operations to apply.',
            items: {
              properties: {
                type: {
                  description: 'Operation type: add, update, remove, or complete.',
                  enum: ['add', 'update', 'remove', 'complete'],
                  type: 'string',
                },
                text: {
                  description: 'For "add": the text to add.',
                  type: 'string',
                },
                index: {
                  description:
                    'For "update", "remove", "complete": the index of the item (0-based).',
                  type: 'number',
                },
                newText: {
                  description: 'For "update": the new text.',
                  type: 'string',
                },
                completed: {
                  description: 'For "update": the new completed status.',
                  type: 'boolean',
                },
              },
              required: ['type'],
              type: 'object',
            },
            type: 'array',
          },
        },
        required: ['operations'],
        type: 'object',
      },
    },
    {
      description: 'Mark todo items as completed by their indices (0-based).',
      name: GTDApiName.completeTodos,
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
      description: 'Remove todo items by their indices (0-based).',
      name: GTDApiName.removeTodos,
      humanIntervention: 'always',
      parameters: {
        properties: {
          indices: {
            description: 'Array of item indices (0-based) to remove.',
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

    // ==================== Planning ====================
    {
      description:
        'Create a high-level plan document describing a goal and its context. Plans define the strategic direction (the "what" and "why"), while todos handle the actionable steps.',
      name: GTDApiName.createPlan,
      parameters: {
        properties: {
          goal: {
            description: 'The main goal or objective to achieve.',
            type: 'string',
          },
          context: {
            description:
              'Additional context, constraints, background information, or strategic considerations relevant to the goal.',
            type: 'string',
          },
        },
        required: ['goal'],
        type: 'object',
      },
    },
    {
      description:
        'Update an existing plan document. Use this to modify the goal, context, or mark the plan as completed.',
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
          context: {
            description: 'Updated context information.',
            type: 'string',
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
