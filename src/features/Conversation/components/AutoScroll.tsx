import { memo, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, onScrollToBottom }) => {
  const trackVisibility = useChatStore((s) => !!s.chatLoadingId);
  const str = useChatStore(chatSelectors.chatsMessageString);

  useEffect(() => {
    if (atBottom && trackVisibility) {
      onScrollToBottom?.('auto');
    }
  }, [atBottom, trackVisibility, str]);

  return <BackBottom onScrollToBottom={() => onScrollToBottom('click')} visible={!atBottom} />;
});

export default AutoScroll;
