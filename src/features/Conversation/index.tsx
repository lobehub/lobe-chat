import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ChatHydration from '@/components/StoreHydration/ChatHydration';

import SkeletonList from './components/SkeletonList';
import ChatList from './components/VirtualizedList';
import { useInitConversation } from './hooks/useInitConversation';

const useStyles = createStyles(
  ({ css, responsive, stylish }) => css`
    position: relative;
    overflow-y: auto;
    height: 100%;

    ${responsive.mobile} {
      ${stylish.noScrollbar}
      width: 100vw;
    }
  `,
);

interface ConversationProps {
  chatInput: ReactNode;
  mobile?: boolean;
}

const Conversation = memo<ConversationProps>(({ chatInput, mobile }) => {
  const { styles } = useStyles();

  const init = useInitConversation();

  return (
    <Flexbox
      flex={1}
      //  position: 'relative' is required, ChatInput's absolute position needs it
      style={{ position: 'relative' }}
    >
      <div className={styles}>
        {init ? <ChatList mobile={mobile} /> : <SkeletonList mobile={mobile} />}
      </div>
      {chatInput}
      <ChatHydration />
    </Flexbox>
  );
});

export default Conversation;
