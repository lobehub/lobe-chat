import { Suspense, lazy } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SkeletonList } from '@/features/ChatList';

const Content = lazy(() => import('./Content'));

interface ChatListProps {
  mobile?: boolean;
}

const ChatList = ({ mobile }: ChatListProps) => (
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
      <Content mobile={mobile} />
    </Suspense>
  </Flexbox>
);

export default ChatList;
