import { ChatToolPayloadWithResult } from '@lobechat/types';
import { Accordion } from '@lobehub/ui';
import { type Key, memo, useCallback, useState } from 'react';

import Tool from './Tool';

interface ToolsRendererProps {
  messageId: string;
  tools: ChatToolPayloadWithResult[];
}

export const Tools = memo<ToolsRendererProps>(({ messageId, tools }) => {
  const [showToolContents, setShowToolDetails] = useState<Key[]>([]);

  const handleExpand = useCallback(
    (id: string) => (expand?: boolean) => {
      if (expand) {
        if (!showToolContents.includes(id)) {
          setShowToolDetails([...showToolContents, id]);
        }
      } else {
        setShowToolDetails(showToolContents.filter((key) => key !== id));
      }
    },
    [showToolContents],
  );

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
            handleExpand={handleExpand(tool.id)}
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
