import { CSSProperties, memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AnimatedCollapsed from '@/components/AnimatedCollapsed';

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
}

const Tool = memo<InspectorProps>(
  ({ arguments: requestArgs, apiName, messageId, id, index, identifier, style, payload }) => {
    const [showRender, setShowRender] = useState(true);
    const [showPluginRender, setShowPluginRender] = useState(false);

    return (
      <Flexbox gap={8} style={style}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          id={id}
          identifier={identifier}
          index={index}
          messageId={messageId}
          payload={payload}
          setShowPluginRender={setShowPluginRender}
          setShowRender={setShowRender}
          showPluginRender={showPluginRender}
          showRender={showRender}
        />
        <AnimatedCollapsed open={showRender}>
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
