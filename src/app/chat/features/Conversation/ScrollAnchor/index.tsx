import { memo, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { useChatStore } from '@/store/chat';

import { useAtBottom } from './useAtBottom';

const ChatScrollAnchor = memo(() => {
  const trackVisibility = useChatStore((s) => !!s.chatLoadingId);

  const isAtBottom = useAtBottom();
  const { ref, entry, inView } = useInView({
    delay: 100,
    rootMargin: '0px 0px -150px 0px',
    trackVisibility,
  });

  useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: 'start',
      });
    }
  }, [inView, entry, isAtBottom, trackVisibility]);

  return <div ref={ref} style={{ height: 1, width: '100%' }} />;
});

export default ChatScrollAnchor;
