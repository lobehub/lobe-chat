import { BuiltinToolManifest } from '@/types/tool';

export const McpUIManifest: BuiltinToolManifest = {
  api: [
    {
      description: 'Render MCP UI resources returned from MCP servers',
      name: 'render_ui',
      parameters: {
        properties: {
          uiResources: {
            description: 'Array of UI resources to render',
            items: {
              properties: {
                content: {
                  description: 'The content of the UI resource (HTML, URL, or iframe source)',
                  type: 'string',
                },
                metadata: {
                  additionalProperties: true,
                  description: 'Additional metadata for the UI resource',
                  type: 'object',
                },
                type: {
                  description: 'The type of UI resource',
                  enum: ['html', 'url', 'iframe'],
                  type: 'string',
                },
              },
              required: ['type', 'content'],
              type: 'object',
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    },
  ],
  identifier: 'mcp-ui-renderer',
  meta: {
    avatar: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+`,
    description: 'Renders UI resources from MCP servers with secure sandboxing',
    title: 'MCP UI Renderer',
  },
  systemRole: `You are the MCP UI Renderer tool. Your purpose is to safely render interactive UI resources returned by MCP servers.

Key capabilities:
- Render HTML content in secure sandboxed iframes
- Display external URLs with proper security handling
- Support multiple UI resources in a single response
- Provide error handling for invalid or unsafe content

Security features:
- Sandboxed iframe execution with restricted permissions
- External URL validation and safe handling
- Content sanitization and validation

Always prioritize user security while providing rich interactive experiences from MCP server responses.`,
  type: 'builtin',
};
