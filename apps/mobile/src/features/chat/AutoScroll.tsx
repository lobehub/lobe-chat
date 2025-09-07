import { memo, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  isScrolling: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, isScrolling, onScrollToBottom }) => {
  const trackVisibility = useChatStore(chatSelectors.isAIGenerating);
  const str = useChatStore(chatSelectors.mainAIChatsMessageString);
  const reasoningStr = useChatStore(chatSelectors.mainAILatestMessageReasoningContent);

  useEffect(() => {
    console.log('atBottom', atBottom);
    console.log('trackVisibility', trackVisibility);
    console.log('isScrolling', isScrolling);
    if (atBottom && trackVisibility && !isScrolling) {
      console.log('scroll to bottom');
      onScrollToBottom?.('auto');
    }
  }, [atBottom, trackVisibility, isScrolling, str, reasoningStr]);

  return <BackBottom onScrollToBottom={() => onScrollToBottom?.('click')} visible={!atBottom} />;
});

export default AutoScroll;
