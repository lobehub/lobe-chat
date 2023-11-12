import { createStyles } from 'antd-style';
import { memo } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_TEXTAREA_HEIGHT_MOBILE } from '@/const/layoutTokens';

import ChatInputArea from './Mobile';

const useStyles = createStyles(
  ({ css, token }) => css`
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;

    width: 100vw;

    background: ${token.colorBgLayout};
  `,
);

const ChatInputMobileLayout = memo(() => {
  const { styles } = useStyles();

  return (
    <>
      <SafeSpacing height={CHAT_TEXTAREA_HEIGHT_MOBILE} mobile position={'bottom'} />
      <div className={styles}>
        <ChatInputArea />
      </div>
    </>
  );
});

export default ChatInputMobileLayout;
