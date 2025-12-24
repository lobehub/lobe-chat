import { ChatToolPayloadWithResult } from '@lobechat/types';
import { Accordion } from '@lobehub/ui';
import { type Key, memo, useCallback, useRef, useState } from 'react';

import Tool from './Tool';

interface ToolsRendererProps {
  messageId: string;
  tools: ChatToolPayloadWithResult[];
}

export const Tools = memo<ToolsRendererProps>(({ messageId, tools }) => {
  const [showToolContents, setShowToolDetails] = useState<Key[]>([]);
  // Track which tools cannot be collapsed (alwaysExpand)
  const nonCollapsibleToolsRef = useRef<Set<string>>(new Set());

  const handleExpandedChange = useCallback((keys: Key[]) => {
    setShowToolDetails((prev) => {
      // Ensure non-collapsible tools stay expanded
      const newKeys = new Set(keys);
      for (const toolId of nonCollapsibleToolsRef.current) {
        newKeys.add(toolId);
      }
      // Only update if different from previous
      const newKeysArray = [...newKeys];
      if (newKeysArray.length === prev.length && newKeysArray.every((k) => prev.includes(k))) {
        return prev;
      }
      return newKeysArray;
    });
  }, []);

  if (!tools || tools.length === 0) return null;

  return (
    <Accordion expandedKeys={showToolContents} gap={8} onExpandedChange={handleExpandedChange}>
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
            onCollapsibleChange={(canCollapse) => {
              if (canCollapse) {
                nonCollapsibleToolsRef.current.delete(tool.id);
              } else {
                nonCollapsibleToolsRef.current.add(tool.id);
              }
            }}
            result={tool.result}
            toolMessageId={tool.result_msg_id}
            type={tool.type}
          />
        );
      })}
    </Accordion>
  );
});
