import { memo, useCallback } from 'react';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}

/**
 * AutoScroll - Automatically scroll to bottom during AI generation
 *
 * Note: We don't need useEffect here because FlashList's maintainVisibleContentPosition
 * already handles auto-scrolling when content changes. We only need to control when
 * to enable/disable it via autoscrollToBottomThreshold in ChatList.
 *
 * This component only manages the BackBottom button visibility.
 */
const AutoScroll = memo<AutoScrollProps>(({ atBottom, onScrollToBottom }) => {
  const handlePress = useCallback(() => {
    onScrollToBottom?.('click');
  }, [onScrollToBottom]);

  return <BackBottom onScrollToBottom={handlePress} visible={!atBottom} />;
});

export default AutoScroll;
