import { ChatToolPayloadWithResult } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';

import Tool from '../Assistant/Tool';

interface ToolsRendererProps {
  messageId: string;
  tools: ChatToolPayloadWithResult[];
}

export const Tools = memo<ToolsRendererProps>(({ messageId, tools }) => {
  if (!tools || tools.length === 0) return null;

  return (
    <Flexbox gap={8}>
      {tools.map((tool, index) => (
        <Tool
          apiName={tool.apiName}
          arguments={tool.arguments}
          id={tool.id}
          identifier={tool.identifier}
          index={index}
          key={tool.id}
          messageId={messageId}
          payload={tool}
          result={tool.result}
          type={tool.type}
        />
      ))}
    </Flexbox>
  );
});

Tools.displayName = 'GroupTools';
