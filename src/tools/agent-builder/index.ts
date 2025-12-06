import { BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';
import { AgentBuilderApiName } from './types';

export const AgentBuilderManifest: BuiltinToolManifest = {
  api: [
    // ==================== Read Operations ====================
    {
      description:
        'Get the complete configuration of the current agent, including model, plugins, chat settings, opening message, etc.',
      name: AgentBuilderApiName.getAgentConfig,
      parameters: {
        properties: {
          fields: {
            description:
              'Optional array of specific fields to retrieve. If not provided, returns all configuration fields. Available fields: model, provider, plugins, chatConfig, openingMessage, openingQuestions, params, tts',
            items: {
              type: 'string',
            },
            type: 'array',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description:
        'Get the metadata of the current agent, including title, description, avatar, tags, and background color.',
      name: AgentBuilderApiName.getAgentMeta,
      parameters: {
        properties: {
          fields: {
            description:
              'Optional array of specific fields to retrieve. If not provided, returns all metadata fields. Available fields: title, description, avatar, tags, backgroundColor',
            items: {
              type: 'string',
            },
            type: 'array',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description:
        'Get all available AI models and providers that can be used for the agent. Returns a list of providers with their supported models and capabilities (vision, function calling, reasoning, etc.).',
      name: AgentBuilderApiName.getAvailableModels,
      parameters: {
        properties: {
          providerId: {
            description:
              'Optional: filter models by a specific provider id (e.g., "openai", "anthropic", "google")',
            type: 'string',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description:
        'Get all available tools (plugins and built-in tools) that can be enabled for the agent. Returns tool identifiers, names, descriptions, and types.',
      name: AgentBuilderApiName.getAvailableTools,
      parameters: {
        properties: {
          type: {
            description:
              'Optional: filter by tool type. "builtin" for built-in tools, "plugin" for installed plugins, "all" for both. Defaults to "all".',
            enum: ['all', 'builtin', 'plugin'],
            type: 'string',
          },
        },
        required: [],
        type: 'object',
      },
    },
    {
      description:
        "Get the current system prompt (systemRole) of the agent. This is the instruction that defines the agent's behavior and personality.",
      name: AgentBuilderApiName.getPrompt,
      parameters: {
        properties: {
          preview: {
            description:
              'Optional: if true, returns a truncated version (first 500 characters) for preview. Defaults to false.',
            type: 'boolean',
          },
        },
        required: [],
        type: 'object',
      },
    },

    // ==================== Write Operations ====================
    {
      description:
        'Update multiple agent configuration fields at once. Use this for bulk updates. For single field updates, prefer specific APIs like setModel, togglePlugin, etc.',
      name: AgentBuilderApiName.updateAgentConfig,
      parameters: {
        properties: {
          config: {
            description:
              'Partial agent configuration object. Only include fields you want to update.',
            properties: {
              chatConfig: {
                description: 'Chat configuration settings',
                type: 'object',
              },
              model: {
                description: 'The AI model identifier',
                type: 'string',
              },
              openingMessage: {
                description: 'Opening message for new conversations',
                type: 'string',
              },
              openingQuestions: {
                description: 'Array of suggested opening questions',
                items: { type: 'string' },
                type: 'array',
              },
              params: {
                description: 'Model parameters like temperature, top_p, etc.',
                type: 'object',
              },
              plugins: {
                description: 'Array of enabled plugin identifiers',
                items: { type: 'string' },
                type: 'array',
              },
              provider: {
                description: 'The AI provider identifier',
                type: 'string',
              },
            },
            type: 'object',
          },
        },
        required: ['config'],
        type: 'object',
      },
    },
    {
      description:
        'Update agent metadata like title, description, avatar, tags. Use this to change how the agent is presented to users.',
      name: AgentBuilderApiName.updateAgentMeta,
      parameters: {
        properties: {
          meta: {
            description: 'Partial metadata object. Only include fields you want to update.',
            properties: {
              avatar: {
                description: 'Agent avatar (emoji or image URL)',
                type: 'string',
              },
              backgroundColor: {
                description: 'Background color for the agent card',
                type: 'string',
              },
              description: {
                description: 'Agent description',
                type: 'string',
              },
              tags: {
                description: 'Array of tags for categorization',
                items: { type: 'string' },
                type: 'array',
              },
              title: {
                description: 'Agent display name',
                type: 'string',
              },
            },
            type: 'object',
          },
        },
        required: ['meta'],
        type: 'object',
      },
    },
    {
      description:
        'Update chat-specific configuration settings like history count, auto-topic creation, streaming, etc.',
      name: AgentBuilderApiName.updateChatConfig,
      parameters: {
        properties: {
          chatConfig: {
            description: 'Partial chat configuration object.',
            properties: {
              autoCreateTopicThreshold: {
                description: 'Number of messages before auto-creating a topic',
                type: 'number',
              },
              displayMode: {
                description: 'Display mode for messages',
                enum: ['chat', 'docs'],
                type: 'string',
              },
              enableAutoCreateTopic: {
                description: 'Whether to automatically create topics',
                type: 'boolean',
              },
              enableCompressHistory: {
                description: 'Whether to compress long conversation history',
                type: 'boolean',
              },
              enableHistoryCount: {
                description: 'Whether to limit history count',
                type: 'boolean',
              },
              enableReasoning: {
                description: 'Whether to enable reasoning/thinking mode',
                type: 'boolean',
              },
              enableStreaming: {
                description: 'Whether to enable streaming output',
                type: 'boolean',
              },
              historyCount: {
                description: 'Number of historical messages to include in context',
                type: 'number',
              },
            },
            type: 'object',
          },
        },
        required: ['chatConfig'],
        type: 'object',
      },
    },
    {
      description:
        "Update the agent's system prompt (systemRole). This is the core instruction that defines how the agent behaves, responds, and interacts with users. Use streaming mode for a typewriter effect in the editor.",
      name: AgentBuilderApiName.updatePrompt,
      parameters: {
        properties: {
          prompt: {
            description:
              'The new system prompt content. Supports markdown formatting. Set to empty string to clear the prompt.',
            type: 'string',
          },
          streaming: {
            description:
              'Whether to use streaming mode for typewriter effect in the editor. Defaults to true for better UX.',
            type: 'boolean',
          },
        },
        required: ['prompt'],
        type: 'object',
      },
    },

    // ==================== Specific Field Operations ====================
    {
      description:
        'Enable or disable a specific plugin for the agent. If enabled is not provided, toggles the current state.',
      name: AgentBuilderApiName.togglePlugin,
      parameters: {
        properties: {
          enabled: {
            description:
              'Whether to enable (true) or disable (false) the plugin. If not provided, toggles current state.',
            type: 'boolean',
          },
          pluginId: {
            description:
              'The identifier of the plugin to toggle (e.g., "lobe-web-browsing", "lobe-image-generation")',
            type: 'string',
          },
        },
        required: ['pluginId'],
        type: 'object',
      },
    },
    {
      description:
        'Set the AI model and provider for the agent. This determines which AI model will be used for conversations.',
      name: AgentBuilderApiName.setModel,
      parameters: {
        properties: {
          model: {
            description:
              'The model identifier (e.g., "gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet-20241022", "gemini-1.5-pro")',
            type: 'string',
          },
          provider: {
            description: 'The provider identifier (e.g., "openai", "anthropic", "google", "azure")',
            type: 'string',
          },
        },
        required: ['model', 'provider'],
        type: 'object',
      },
    },
    {
      description:
        'Set the opening message that is displayed when a user starts a new conversation with the agent.',
      name: AgentBuilderApiName.setOpeningMessage,
      parameters: {
        properties: {
          message: {
            description:
              'The opening message text. Can include markdown formatting. Set to empty string to remove.',
            type: 'string',
          },
        },
        required: ['message'],
        type: 'object',
      },
    },
    {
      description:
        'Set the suggested opening questions that help users get started with the agent.',
      name: AgentBuilderApiName.setOpeningQuestions,
      parameters: {
        properties: {
          questions: {
            description:
              'Array of suggested questions. Set to empty array to remove all questions.',
            items: {
              type: 'string',
            },
            type: 'array',
          },
        },
        required: ['questions'],
        type: 'object',
      },
    },
  ],
  identifier: 'lobe-agent-builder',
  meta: {
    avatar: '🛠️',
    title: 'Agent Builder',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};

export { AgentBuilderApiName } from './types';
