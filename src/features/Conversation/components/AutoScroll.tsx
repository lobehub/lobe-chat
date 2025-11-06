import { memo, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors, messageStateSelectors } from '@/store/chat/selectors';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  isScrolling: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, isScrolling, onScrollToBottom }) => {
  const trackVisibility = useChatStore(messageStateSelectors.isAIGenerating);
  const str = useChatStore(chatSelectors.mainAIChatsMessageString);
  const reasoningStr = useChatStore(chatSelectors.mainAILatestMessageReasoningContent);

  useEffect(() => {
    if (atBottom && trackVisibility && !isScrolling) {
      onScrollToBottom?.('auto');
    }
  }, [atBottom, trackVisibility, str, reasoningStr]);

  return <BackBottom onScrollToBottom={() => onScrollToBottom('click')} visible={!atBottom} />;
});

export default AutoScroll;
