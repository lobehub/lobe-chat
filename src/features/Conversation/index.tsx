import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonList from './components/SkeletonList';
import ChatList from './components/VirtualizedList';

interface ConversationProps {
  mobile?: boolean;
}

const Conversation = ({ mobile }: ConversationProps) => {
  return (
    <Flexbox
      flex={1}
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
  );
};

export default Conversation;
