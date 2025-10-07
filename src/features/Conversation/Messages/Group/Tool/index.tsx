import { ChatToolResult } from '@lobechat/types';
import { CSSProperties, memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AnimatedCollapsed from '@/components/AnimatedCollapsed';

import Inspectors from './Inspector';
import Render from './Render';

export interface GroupToolProps {
  apiName: string;
  arguments?: string;
  id: string;
  identifier: string;
  index: number;
  /**
   * ContentBlock ID (not the group message ID)
   */
  messageId: string;
  result?: ChatToolResult;
  style?: CSSProperties;
  type?: string;
}

/**
 * Tool component for Group Messages
 *
 * In group messages, all tools are completed (no streaming),
 * so we always show the results directly.
 */
const Tool = memo<GroupToolProps>(
  ({ arguments: requestArgs, apiName, messageId, id, index, identifier, style, result, type }) => {
    // Default to false since group messages are all completed
    const [showDetail, setShowDetail] = useState(false);
    const [showPluginRender, setShowPluginRender] = useState(false);

    return (
      <Flexbox gap={8} style={style}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          // mcp don't have ui render
          hidePluginUI={type === 'mcp'}
          id={id}
          identifier={identifier}
          index={index}
          messageId={messageId}
          result={result}
          setShowPluginRender={setShowPluginRender}
          setShowRender={setShowDetail}
          showPluginRender={showPluginRender}
          showRender={showDetail}
          type={type}
        />
        <AnimatedCollapsed open={showDetail} width={{ collapsed: 'auto' }}>
          <Render
            apiName={apiName}
            arguments={requestArgs}
            identifier={identifier}
            messageId={messageId}
            result={result}
            setShowPluginRender={setShowPluginRender}
            showPluginRender={showPluginRender}
            toolCallId={id}
            type={type}
          />
        </AnimatedCollapsed>
      </Flexbox>
    );
  },
);

Tool.displayName = 'GroupTool';

export default Tool;
