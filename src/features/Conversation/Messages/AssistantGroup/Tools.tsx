import { ChatToolPayloadWithResult } from '@lobechat/types';
import { Block } from '@lobehub/ui';
import { memo } from 'react';

import Tool from './Tool';

interface ToolsRendererProps {
  messageId: string;
  tools: ChatToolPayloadWithResult[];
}

export const Tools = memo<ToolsRendererProps>(({ messageId, tools }) => {
  if (!tools || tools.length === 0) return null;

  return (
    <Block
      className={'tool-blocks'}
      gap={8}
      paddingBlock={6}
      paddingInline={12}
      variant={'outlined'}
    >
      {tools.map((tool, index) => (
        <Tool
          apiName={tool.apiName}
          arguments={tool.arguments}
          assistantMessageId={messageId}
          id={tool.id}
          identifier={tool.identifier}
          index={index}
          intervention={tool.intervention}
          key={tool.id}
          result={tool.result}
          toolMessageId={tool.result_msg_id}
          type={tool.type}
        />
      ))}
    </Block>
  );
});
