import { createStyles } from 'antd-style';
import { memo } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_TEXTAREA_HEIGHT_MOBILE } from '@/const/layoutTokens';

import ChatInputContent from '../../features/ChatInputContent';

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
        <ChatInputContent mobile />
      </div>
    </>
  );
});

export default ChatInputMobileLayout;
