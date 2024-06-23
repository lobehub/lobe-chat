import { Suspense, lazy } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonList from './components/SkeletonList';

const ChatList = lazy(() => import('./components/VirtualizedList'));

interface ConversationProps {
  mobile?: boolean;
}

const Conversation = ({ mobile }: ConversationProps) => {
  return (
    <Flexbox
      flex={1}
      style={{
        WebkitTransform: 'translate3d(0, 0, 0)',
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
