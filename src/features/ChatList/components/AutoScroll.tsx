import { memo, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { displayMessageSelectors, operationSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  isScrolling: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, isScrolling, onScrollToBottom }) => {
  const trackVisibility = useChatStore(operationSelectors.isAgentRuntimeRunning);
  const str = useChatStore(displayMessageSelectors.mainAIChatsMessageString);
  const reasoningStr = useChatStore(displayMessageSelectors.mainAILatestMessageReasoningContent);
  const autoScroll = useUserStore(userGeneralSettingsSelectors.autoScroll);

  useEffect(() => {
    if (atBottom && trackVisibility && !isScrolling && autoScroll) {
      onScrollToBottom?.('auto');
    }
  }, [atBottom, trackVisibility, str, reasoningStr, autoScroll]);

  return <BackBottom onScrollToBottom={() => onScrollToBottom('click')} visible={!atBottom} />;
});

export default AutoScroll;
