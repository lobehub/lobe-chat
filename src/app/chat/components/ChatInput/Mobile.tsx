import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_TEXTAREA_HEIGHT_MOBILE } from '@/const/layoutTokens';

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

interface ChatInputMobileLayoutProps {
  children: ReactNode;
  expand?: boolean;
}

const ChatInputMobileLayout = memo<ChatInputMobileLayoutProps>(({ children }) => {
  const { styles } = useStyles();
  return (
    <>
      <SafeSpacing height={CHAT_TEXTAREA_HEIGHT_MOBILE} mobile position={'bottom'} />
      <div className={styles}>{children}</div>
    </>
  );
});

export default ChatInputMobileLayout;
