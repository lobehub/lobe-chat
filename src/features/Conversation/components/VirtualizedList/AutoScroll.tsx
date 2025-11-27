'use client';

import { memo, useEffect } from 'react';

import BackBottom from '../BackBottom';

import { useConversationStore, virtuaListSelectors } from '../../store';

interface AutoScrollProps {
  /**
   * Whether AI is generating (for auto-scroll during generation)
   */
  isGenerating?: boolean;
}

const AutoScroll = memo<AutoScrollProps>(({ isGenerating }) => {
  const atBottom = useConversationStore(virtuaListSelectors.atBottom);
  const isScrolling = useConversationStore(virtuaListSelectors.isScrolling);
  const scrollToBottom = useConversationStore((s) => s.scrollToBottom);

  useEffect(() => {
    if (atBottom && isGenerating && !isScrolling) {
      scrollToBottom(false);
    }
  }, [atBottom, isGenerating, isScrolling, scrollToBottom]);

  return (
    <BackBottom onScrollToBottom={() => scrollToBottom(true)} visible={!atBottom} />
  );
});

AutoScroll.displayName = 'ConversationAutoScroll';

export default AutoScroll;
