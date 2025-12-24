import { ChatToolPayloadWithResult } from '@lobechat/types';
import { Accordion } from '@lobehub/ui';
import { type Key, memo, useState } from 'react';

import Tool from './Tool';

interface ToolsRendererProps {
  messageId: string;
  tools: ChatToolPayloadWithResult[];
}

export const Tools = memo<ToolsRendererProps>(({ messageId, tools }) => {
  const [showToolContents, setShowToolDetails] = useState<Key[]>([]);

  if (!tools || tools.length === 0) return null;

  return (
    <Accordion
      expandedKeys={showToolContents}
      gap={8}
      onExpandedChange={(keys) => setShowToolDetails(keys)}
    >
      {tools.map((tool) => {
        return (
          <Tool
            apiName={tool.apiName}
            arguments={tool.arguments}
            assistantMessageId={messageId}
            expand={showToolContents.includes(tool.id)}
            handleExpand={(expand?: boolean) => {
              setShowToolDetails((prev = []) => {
                if (expand) {
                  if (!prev.includes(tool.id)) {
                    return [...prev, tool.id];
                  } else {
                    return prev;
                  }
                } else {
                  return prev.filter((key) => key !== tool.id);
                }
              });
            }}
            id={tool.id}
            identifier={tool.identifier}
            intervention={tool.intervention}
            key={tool.id}
            result={tool.result}
            toolMessageId={tool.result_msg_id}
            type={tool.type}
          />
        );
      })}
    </Accordion>
  );
});
