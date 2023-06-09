import { memo } from 'react';

import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import ChatList from './ChatList';
import ChatInput from './Input';

const useStyles = createStyles(({ css, token }) => ({
  input: css`
    position: sticky;
    z-index: 10;
    bottom: 0;
    background: ${token.colorBgLayout};
  `,
}));

const Conversation = () => {
  const { styles } = useStyles();
  return (
    <>
      <div style={{ flex: 1, overflowY: 'scroll' }}>
        <ChatList />
      </div>
      <Flexbox className={styles.input}>
        <ChatInput />
      </Flexbox>
    </>
  );
};

export default memo(Conversation);
