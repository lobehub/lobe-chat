import { memo } from 'react';

import BackBottom from './BackBottom';

interface AutoScrollProps {
  atBottom: boolean;
  onScrollToBottom: (type: 'auto' | 'click') => void;
}
const AutoScroll = memo<AutoScrollProps>(({ atBottom, onScrollToBottom }) => {
  return <BackBottom onScrollToBottom={() => onScrollToBottom?.('click')} visible={!atBottom} />;
});

export default AutoScroll;
