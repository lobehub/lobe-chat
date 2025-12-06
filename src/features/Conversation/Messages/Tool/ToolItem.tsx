import { CSSProperties, memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Inspectors from './Inspector';
import Render from './Render';

export interface InspectorProps {
  apiName: string;
  arguments?: string;
  identifier: string;
  index: number;
  messageId: string;
  payload: object;
  style?: CSSProperties;
  toolCallId: string;
  type?: string;
}

const Tool = memo<InspectorProps>(
  ({ arguments: requestArgs, apiName, messageId, toolCallId, index, identifier, payload }) => {
    const [showPluginRender, setShowPluginRender] = useState(false);

    return (
      <Flexbox gap={8} style={{ paddingBottom: 12 }}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          id={toolCallId}
          identifier={identifier}
          index={index}
          messageId={messageId}
          payload={payload}
          setShowPluginRender={setShowPluginRender}
          showPluginRender={showPluginRender}
        />
        <Render
          messageId={messageId}
          requestArgs={requestArgs}
          setShowPluginRender={setShowPluginRender}
          showPluginRender={showPluginRender}
          toolCallId={toolCallId}
          toolIndex={index}
        />
      </Flexbox>
    );
  },
);

Tool.displayName = 'AssistantTool';

export default Tool;
