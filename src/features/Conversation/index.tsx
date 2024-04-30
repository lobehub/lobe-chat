import { createStyles } from 'antd-style';
import { ReactNode, Suspense, lazy, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ChatHydration from '@/components/StoreHydration/ChatHydration';

import SkeletonList from './components/SkeletonList';

const ChatList = lazy(() => import('./components/VirtualizedList'));

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

  return (
    <Flexbox
      flex={1}
      // `relative` is required, ChatInput's absolute position needs it
      style={{ position: 'relative' }}
    >
      <div className={styles}>
        <Suspense fallback={<SkeletonList mobile={mobile} />}>
          <ChatList mobile={mobile} />
        </Suspense>
      </div>
      {chatInput}
      <ChatHydration />
    </Flexbox>
  );
});

export default Conversation;
