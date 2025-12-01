import { BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';
import { AgentBuilderApiName } from './type';

export const AgentBuilderManifest: BuiltinToolManifest = {
  api: [
    // ===== Query APIs =====
    {
      description:
        'Get current agent configuration including meta info, system role, model settings, and enabled tools.',
      name: AgentBuilderApiName.getAgentInfo,
      parameters: {
        properties: {
          agentId: {
            description: 'Optional agent ID. If not provided, returns current active agent info.',
            type: 'string',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description: 'List all available tools/plugins that can be enabled for the agent.',
      name: AgentBuilderApiName.listAvailableTools,
      parameters: {
        properties: {
          category: {
            description: 'Filter tools by category. Defaults to "all".',
            enum: ['builtin', 'plugin', 'all'],
            type: 'string',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description: 'List all available AI models that can be used by the agent.',
      name: AgentBuilderApiName.listAvailableModels,
      parameters: {
        properties: {
          provider: {
            description: 'Optional provider filter (e.g., "openai", "anthropic").',
            type: 'string',
          },
        },
        required: [],
        type: 'object',
      },
    },

    // ===== Create/Update APIs =====
    {
      description: 'Create a new AI agent with specified configuration.',
      humanIntervention: 'required',
      name: AgentBuilderApiName.createAgent,
      parameters: {
        properties: {
          avatar: {
            description: 'Avatar emoji or image URL.',
            type: 'string',
          },
          description: {
            description: 'A brief description of what the agent does.',
            type: 'string',
          },
          model: {
            description: 'The AI model to use (e.g., "gpt-4o", "claude-3-5-sonnet").',
            type: 'string',
          },
          plugins: {
            description: 'Array of plugin identifiers to enable.',
            items: { type: 'string' },
            type: 'array',
          },
          provider: {
            description: 'The model provider (e.g., "openai", "anthropic").',
            type: 'string',
          },
          systemRole: {
            description: "The system prompt that defines the agent's behavior.",
            type: 'string',
          },
          tags: {
            description: 'Tags for categorizing the agent.',
            items: { type: 'string' },
            type: 'array',
          },
          title: {
            description: 'The display name of the agent.',
            type: 'string',
          },
        },
        required: ['title', 'systemRole'],
        type: 'object',
      },
    },
    {
      description: 'Update agent meta information (title, description, avatar, tags).',
      name: AgentBuilderApiName.updateAgentMeta,
      parameters: {
        properties: {
          avatar: {
            description: 'New avatar emoji or URL.',
            type: 'string',
          },
          backgroundColor: {
            description: 'Background color for the avatar.',
            type: 'string',
          },
          description: {
            description: 'New description.',
            type: 'string',
          },
          tags: {
            description: 'New tags array.',
            items: { type: 'string' },
            type: 'array',
          },
          title: {
            description: 'New display name.',
            type: 'string',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description: "Update the agent's system prompt/role.",
      name: AgentBuilderApiName.updateSystemRole,
      parameters: {
        properties: {
          append: {
            description: 'If true, append to existing prompt instead of replacing.',
            type: 'boolean',
          },
          systemRole: {
            description: 'The new system prompt defining agent behavior.',
            type: 'string',
          },
        },
        required: ['systemRole'],
        type: 'object',
      },
    },
    {
      description: "Update the agent's model configuration.",
      name: AgentBuilderApiName.updateModelConfig,
      parameters: {
        properties: {
          frequencyPenalty: {
            description: 'Frequency penalty (-2 to 2).',
            type: 'number',
          },
          maxTokens: {
            description: 'Maximum tokens in response.',
            type: 'number',
          },
          model: {
            description: 'The model identifier.',
            type: 'string',
          },
          presencePenalty: {
            description: 'Presence penalty (-2 to 2).',
            type: 'number',
          },
          provider: {
            description: 'The provider identifier.',
            type: 'string',
          },
          temperature: {
            description: 'Temperature for response randomness (0-2).',
            type: 'number',
          },
          topP: {
            description: 'Top P for nucleus sampling (0-1).',
            type: 'number',
          },
        },
        required: [],
        type: 'object',
      },
    },

    // ===== Tool Configuration APIs =====
    {
      description: 'Enable a tool/plugin for the agent.',
      name: AgentBuilderApiName.enableTool,
      parameters: {
        properties: {
          toolId: {
            description: 'The identifier of the tool to enable.',
            type: 'string',
          },
        },
        required: ['toolId'],
        type: 'object',
      },
    },
    {
      description: 'Disable a tool/plugin for the agent.',
      name: AgentBuilderApiName.disableTool,
      parameters: {
        properties: {
          toolId: {
            description: 'The identifier of the tool to disable.',
            type: 'string',
          },
        },
        required: ['toolId'],
        type: 'object',
      },
    },

    // ===== Knowledge Base APIs =====
    {
      description: 'Add a knowledge base to the agent.',
      name: AgentBuilderApiName.addKnowledgeBase,
      parameters: {
        properties: {
          knowledgeBaseId: {
            description: 'The ID of the knowledge base to add.',
            type: 'string',
          },
        },
        required: ['knowledgeBaseId'],
        type: 'object',
      },
    },
    {
      description: 'Remove a knowledge base from the agent.',
      name: AgentBuilderApiName.removeKnowledgeBase,
      parameters: {
        properties: {
          knowledgeBaseId: {
            description: 'The ID of the knowledge base to remove.',
            type: 'string',
          },
        },
        required: ['knowledgeBaseId'],
        type: 'object',
      },
    },

    // ===== Advanced Configuration APIs =====
    {
      description: 'Update chat behavior configuration.',
      name: AgentBuilderApiName.updateChatConfig,
      parameters: {
        properties: {
          autoCreateTopicThreshold: {
            description: 'Number of messages before auto-creating topic.',
            type: 'number',
          },
          displayMode: {
            description: 'Chat display mode.',
            enum: ['chat', 'docs'],
            type: 'string',
          },
          enableAutoCreateTopic: {
            description: 'Auto-create topics based on conversation.',
            type: 'boolean',
          },
          enableCompressHistory: {
            description: 'Compress history when it gets too long.',
            type: 'boolean',
          },
          enableHistoryCount: {
            description: 'Limit history messages sent to model.',
            type: 'boolean',
          },
          historyCount: {
            description: 'Number of history messages to include.',
            type: 'number',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description: 'Update agent opening message and questions.',
      name: AgentBuilderApiName.updateOpeningConfig,
      parameters: {
        properties: {
          openingMessage: {
            description: 'The opening message shown when starting a conversation.',
            type: 'string',
          },
          openingQuestions: {
            description: 'Suggested questions shown at conversation start.',
            items: { type: 'string' },
            type: 'array',
          },
        },
        required: [],
        type: 'object',
      },
    },
  ],
  identifier: 'lobe-agent-builder',
  meta: {
    avatar: '🤖',
    title: 'Agent Builder',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};

export { AgentBuilderApiName } from './type';
export type * from './type';
