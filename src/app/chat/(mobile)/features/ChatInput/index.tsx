import { createStyles } from 'antd-style';
import { memo, useState } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_TEXTAREA_HEIGHT_MOBILE } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';

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

  const [message, setMessage] = useState('');

  const [isLoading, sendMessage, stopGenerateMessage] = useSessionStore((s) => [
    !!s.chatLoadingId,
    s.sendMessage,
    s.stopGenerateMessage,
  ]);

  return (
    <>
      <SafeSpacing height={CHAT_TEXTAREA_HEIGHT_MOBILE} mobile position={'bottom'} />
      <div className={styles}>
        <ChatInputArea
          loading={isLoading}
          onChange={setMessage}
          onSend={sendMessage}
          onStop={stopGenerateMessage}
          value={message}
        />
      </div>
    </>
  );
});

export default ChatInputMobileLayout;
