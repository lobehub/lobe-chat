import { ChatToolResult, ToolIntervention } from '@lobechat/types';
import { CSSProperties, memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AnimatedCollapsed from '@/components/AnimatedCollapsed';

import Inspectors from './Inspector';
import Render from './Render';

export interface GroupToolProps {
  apiName: string;
  arguments?: string;
  /**
   * ContentBlock ID (not the group message ID)
   */
  assistantMessageId: string;
  id: string;
  identifier: string;
  index: number;
  intervention?: ToolIntervention;
  result?: ChatToolResult;
  style?: CSSProperties;
  toolMessageId?: string;
  type?: string;
}

/**
 * Tool component for Group Messages
 *
 * In group messages, all tools are completed (no streaming),
 * so we always show the results directly.
 */
const Tool = memo<GroupToolProps>(
  ({
    arguments: requestArgs,
    apiName,
    assistantMessageId,
    id,
    intervention,
    index,
    identifier,
    style,
    result,
    type,
    toolMessageId,
  }) => {
    // Default to false since group messages are all completed

    const [showToolContent, setShowToolDetail] = useState(false);
    const [showCustomPluginUI, setShowCustomPluginUI] = useState(false);

    useEffect(() => {
      if (intervention?.status === 'pending') {
        setShowToolDetail(true);
      }
    }, [intervention?.status]);

    return (
      <Flexbox gap={8} style={style}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          assistantMessageId={assistantMessageId}
          id={id}
          identifier={identifier}
          index={index}
          intervention={intervention}
          result={result}
          setShowPluginRender={setShowCustomPluginUI}
          setShowRender={setShowToolDetail}
          showPluginRender={showCustomPluginUI}
          showRender={showToolContent}
          toolMessageId={toolMessageId}
          type={type}
        />
        <AnimatedCollapsed open={showToolContent} width={{ collapsed: 'auto' }}>
          <Render
            apiName={apiName}
            arguments={requestArgs}
            identifier={identifier}
            intervention={intervention}
            messageId={assistantMessageId}
            result={result}
            setShowPluginRender={setShowCustomPluginUI}
            showPluginRender={showCustomPluginUI}
            toolCallId={id}
            toolMessageId={toolMessageId}
            type={type}
          />
        </AnimatedCollapsed>
      </Flexbox>
    );
  },
);

Tool.displayName = 'GroupTool';

export default Tool;
