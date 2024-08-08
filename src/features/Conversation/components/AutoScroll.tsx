import { memo, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import BackBottom from './BackBottom';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

interface AutoScrollProps {
  atBottom: boolean;
  isScrolling: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, isScrolling, onScrollToBottom }) => {
  const trackVisibility = useChatStore(chatSelectors.isAIGenerating);
  const state = useChatStore();
  const config = agentSelectors.currentAgentChatConfig(useAgentStore.getState());
  const str = chatSelectors.chatsMessageString(state, config);

  useEffect(() => {
    if (atBottom && trackVisibility && !isScrolling) {
      onScrollToBottom?.('auto');
    }
  }, [atBottom, trackVisibility, str]);

  return <BackBottom onScrollToBottom={() => onScrollToBottom('click')} visible={!atBottom} />;
});

export default AutoScroll;
