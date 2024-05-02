import { ReactNode, Suspense, lazy } from 'react';
import { Flexbox } from 'react-layout-kit';

import ChatHydration from '@/components/StoreHydration/ChatHydration';

import SkeletonList from './components/SkeletonList';

const ChatList = lazy(() => import('./components/VirtualizedList'));

interface ConversationProps {
  chatInput: ReactNode;
  mobile?: boolean;
}

const Conversation = ({ chatInput, mobile }: ConversationProps) => {
  return (
    <Flexbox
      flex={1}
      height={'100%'}
      // `relative` is required, ChatInput's absolute position needs it
      style={{ position: 'relative' }}
    >
      <Flexbox
        height={'100%'}
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'relative',
        }}
        width={'100%'}
      >
        <Suspense fallback={<SkeletonList mobile={mobile} />}>
          <ChatList mobile={mobile} />
        </Suspense>
      </Flexbox>
      {chatInput}
      <ChatHydration />
    </Flexbox>
  );
};

export default Conversation;
