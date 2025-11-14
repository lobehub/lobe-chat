'use client';

import { PropsWithChildren, memo } from 'react';

import Desktop from './Desktop';
import Mobile from './Mobile';

interface ChatLayoutProps extends PropsWithChildren {
  mobile?: boolean;
}

const ChatLayout = memo<ChatLayoutProps>(({ children, mobile }) => {
  if (mobile) {
    return <Mobile>{children}</Mobile>;
  }

  return <Desktop>{children}</Desktop>;
});

ChatLayout.displayName = 'ChatLayout';

export default ChatLayout;
