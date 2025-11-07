import { Markdown } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ToolCallResult } from '@/libs/mcp';

export interface MCPTypeProps {
  apiName?: string;
  arguments?: string;
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
  pluginError?: any;
  pluginState?: ToolCallResult;
}

const MCPType = memo<MCPTypeProps>(({ pluginState }) => {
  if (!pluginState) return;

  const { content } = pluginState;

  return (
    <Flexbox style={{ maxHeight: 200, overflow: 'scroll', padding: 8, width: '100%' }}>
      <Flexbox>
        {content.map((item) => {
          switch (item.type) {
            case 'text': {
              return (
                <Markdown key={item.text} variant={'chat'}>
                  {item.text}
                </Markdown>
              );
            }

            default: {
              return null;
            }
          }
        })}
      </Flexbox>
    </Flexbox>
  );
});

export default MCPType;
