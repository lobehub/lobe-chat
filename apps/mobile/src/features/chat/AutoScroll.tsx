import { memo, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  isScrolling: boolean;
  onScrollToBottom: () => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, isScrolling, onScrollToBottom }) => {
  const trackVisibility = useChatStore(chatSelectors.isAIGenerating);
  const str = useChatStore(chatSelectors.mainAIChatsMessageString);
  const reasoningStr = useChatStore(chatSelectors.mainAILatestMessageReasoningContent);

  useEffect(() => {
    if (atBottom && trackVisibility && !isScrolling) {
      onScrollToBottom?.();
    }
  }, [atBottom, trackVisibility, str, reasoningStr]);

  return <BackBottom onScrollToBottom={onScrollToBottom} visible={!atBottom} />;
});

export default AutoScroll;
