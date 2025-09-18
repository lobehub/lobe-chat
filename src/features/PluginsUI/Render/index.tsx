import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { memo } from 'react';

import McpUIRender from '@/tools/mcp-ui/Render';
import { extractUIResources } from '@/tools/mcp-ui/utils/extractUIResources';
import { LobeToolRenderType } from '@/types/tool';

import BuiltinType from './BuiltinType';
import DefaultType from './DefaultType';
import Markdown from './MarkdownType';
import Standalone from './StandaloneType';

export interface PluginRenderProps {
  arguments?: string;
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
  payload?: PluginRequestPayload;
  pluginError?: any;
  pluginState?: any;
  type?: LobeToolRenderType;
}

const PluginRender = memo<PluginRenderProps>(
  ({
    content,
    arguments: argumentsStr = '',
    id,
    payload,
    pluginState,
    identifier,
    type,
    loading,
    pluginError,
  }) => {
    switch (type) {
      case 'standalone': {
        return <Standalone id={id} name={identifier} payload={payload} />;
      }

      case 'builtin': {
        return (
          <BuiltinType
            apiName={payload?.apiName}
            arguments={argumentsStr}
            content={content}
            id={id}
            identifier={identifier}
            loading={loading}
            pluginError={pluginError}
            pluginState={pluginState}
          />
        );
      }

      case 'mcp-ui': {
        try {
          // Extract UI resources from our encoded format
          const { textContent, uiResources } = extractUIResources(content);

          const mcpUIContent = {
            text: textContent,
            uiResources: uiResources,
          };

          return (
            <McpUIRender
              apiName={payload?.apiName}
              args={{}}
              content={mcpUIContent}
              identifier={identifier}
              messageId={id}
              pluginError={pluginError}
              pluginState={pluginState}
            />
          );
        } catch (error) {
          console.error('Failed to parse MCP UI content:', error);
          return <DefaultType content={content} loading={loading} name={identifier} />;
        }
      }

      case 'markdown': {
        return <Markdown content={content} loading={loading} />;
      }

      default: {
        return <DefaultType content={content} loading={loading} name={identifier} />;
      }
    }
  },
);

export default PluginRender;
