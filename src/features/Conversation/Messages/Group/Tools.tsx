import { ChatToolPayloadWithResult } from '@lobechat/types';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Tool from './Tool';

const useStyles = createStyles(({ css, token }) => {
  return {
    toolsContainer: css`
      padding-block: 6px;
      padding-inline: 12px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 8px;
    `,
  };
});

interface ToolsRendererProps {
  messageId: string;
  tools: ChatToolPayloadWithResult[];
}

export const Tools = memo<ToolsRendererProps>(({ messageId, tools }) => {
  const { styles, cx } = useStyles();

  if (!tools || tools.length === 0) return null;

  return (
    <Flexbox className={cx(styles.toolsContainer, 'tool-blocks')} gap={8}>
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
    </Flexbox>
  );
});
