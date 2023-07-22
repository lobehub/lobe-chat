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

  // 只有 ai 的 message 才会需要展示
  if (role !== 'assistant') return;
  // 只有当 当前的 model 和 fromModel 不一致时，才需要展示
  if (extra?.fromModel && model === extra?.fromModel) return;

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
