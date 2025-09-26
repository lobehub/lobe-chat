import { CSSProperties, memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AnimatedCollapsed from '@/components/AnimatedCollapsed';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { hasUIResources } from '@/tools/mcp-ui/utils/extractUIResources';

import Inspectors from './Inspector';
import Render from './Render';

export interface InspectorProps {
  apiName: string;
  arguments?: string;
  id: string;
  identifier: string;
  index: number;
  messageId: string;
  payload: object;
  style?: CSSProperties;
  type?: string;
}

const Tool = memo<InspectorProps>(
  ({ arguments: requestArgs, apiName, messageId, id, index, identifier, style, payload, type }) => {
    const [showDetail, setShowDetail] = useState(type !== 'mcp');
    const [showPluginRender, setShowPluginRender] = useState(false);
    const isLoading = useChatStore(chatSelectors.isInToolsCalling(messageId, index));

    // Get the tool message to check for UI resources
    const toolMessage = useChatStore((s) => chatSelectors.getMessageByToolCallId(id)(s));

    // Check if MCP response contains UI resources
    const mcpHasUIResources =
      type === 'mcp' && toolMessage?.content && hasUIResources(toolMessage.content);

    useEffect(() => {
      if (type !== 'mcp') return;

      // Hide detail view for MCP tools with UI resources (unless loading)
      if (mcpHasUIResources && !isLoading) {
        setShowDetail(false);
        return;
      }

      setTimeout(
        () => {
          setShowDetail(isLoading);
        },
        isLoading ? 1 : 1500,
      );
    }, [isLoading, mcpHasUIResources]);

    return (
      <Flexbox gap={8} style={style}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          // Allow MCP UI render when UI resources are detected
          hidePluginUI={type === 'mcp' && !mcpHasUIResources}
          id={id}
          identifier={identifier}
          index={index}
          messageId={messageId}
          payload={payload}
          setShowPluginRender={setShowPluginRender}
          setShowRender={setShowDetail}
          showPluginRender={showPluginRender}
          showRender={showDetail}
        />
        <AnimatedCollapsed open={showDetail}>
          <Render
            messageId={messageId}
            requestArgs={requestArgs}
            setShowPluginRender={setShowPluginRender}
            showPluginRender={showPluginRender}
            toolCallId={id}
            toolIndex={index}
          />
        </AnimatedCollapsed>
      </Flexbox>
    );
  },
);

Tool.displayName = 'AssistantTool';

export default Tool;
