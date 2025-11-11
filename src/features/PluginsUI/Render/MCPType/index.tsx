import { Markdown } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Arguments from '@/features/Conversation/Messages/Group/Tool/Render/Arguments';
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

const MCPType = memo<MCPTypeProps>(({ pluginState, arguments: args }) => {
  if (!pluginState) return;

  const { content } = pluginState;

  return (
    <Flexbox gap={8} style={{ maxHeight: 400, overflow: 'scroll', padding: 8, width: '100%' }}>
      <div>
        <Arguments arguments={args} />
      </div>
      <Flexbox>
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
    </Flexbox>
  );
});

export default MCPType;
