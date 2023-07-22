import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, useSessionStore } from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';

const useStyles = createStyles(({ css }) => ({
  container: css`
    margin-top: 8px;
  `,
}));

const MessageExtra = ({ role, extra }: ChatMessage): ReactNode => {
  const { styles } = useStyles();

  const [model] = useSessionStore((s) => [agentSelectors.currentAgentModel(s)], shallow);

  // 1. 只有 ai 的 message
  // 2. 且存在 fromModel
  // 3. 且当前的 model 和 fromModel 不一致时
  if (role === 'assistant' && extra?.fromModel && model !== extra?.fromModel)
    // 才需要展示 model tag
    return (
      <Flexbox className={styles.container}>
        <div>
          <Tag bordered={false} style={{ borderRadius: 6 }}>
            {extra?.fromModel}
          </Tag>
        </div>
      </Flexbox>
    );
};

export default MessageExtra;
