import { CSSProperties, memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import Inspectors from '../AssistantGroup/Tool/Inspector';
import Render from '../AssistantGroup/Tool/Render';

export interface InspectorProps {
  apiName: string;
  arguments?: string;
  identifier: string;
  index: number;
  messageId: string;
  style?: CSSProperties;
  toolCallId: string;
  type?: string;
}

/**
 * Tool message component - adapts Tool message data to use AssistantGroup/Tool components
 */
const Tool = memo<InspectorProps>(
  ({ arguments: requestArgs, apiName, messageId, toolCallId, index, identifier, type }) => {
    const [showPluginRender, setShowPluginRender] = useState(false);
    const [showRender, setShowRender] = useState(false);

    // Fetch tool message from store
    const toolMessage = useConversationStore(dataSelectors.getDbMessageByToolCallId(toolCallId));

    // Check if tool is still loading
    const loading = useConversationStore(
      messageStateSelectors.isToolCallStreaming(messageId, index),
    );

    // Adapt tool message data to AssistantGroup/Tool format
    const result = toolMessage
      ? {
          content: toolMessage.content,
          error: toolMessage.error,
          id: toolCallId,
          state: toolMessage.pluginState,
        }
      : undefined;

    // Don't render if still loading and no message yet
    if (loading && !toolMessage) return null;

    return (
      <Flexbox gap={8} style={{ paddingBottom: 12 }}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          assistantMessageId={messageId}
          id={toolCallId}
          identifier={identifier}
          index={index}
          result={result}
          setShowPluginRender={setShowPluginRender}
          setShowRender={setShowRender}
          showPluginRender={showPluginRender}
          showRender={showRender}
          type={type}
        />
        <Render
          apiName={apiName}
          arguments={requestArgs}
          identifier={identifier}
          messageId={messageId}
          result={result}
          setShowPluginRender={setShowPluginRender}
          showPluginRender={showPluginRender}
          toolCallId={toolCallId}
          type={type}
        />
      </Flexbox>
    );
  },
);

Tool.displayName = 'AssistantTool';

export default Tool;
