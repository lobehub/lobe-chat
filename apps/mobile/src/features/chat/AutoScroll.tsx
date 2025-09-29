import { memo, useCallback } from 'react';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, onScrollToBottom }) => {
  const handlePress = useCallback(() => {
    onScrollToBottom?.('click');
  }, [onScrollToBottom]);

  return <BackBottom onScrollToBottom={handlePress} visible={!atBottom} />;
});

export default AutoScroll;
