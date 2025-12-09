import { memo } from 'react';

import { useChatGroupStore } from '@/store/chatGroup';

const Title = memo(() => {
  useChatGroupStore((s) => s.activeThreadAgentId);
  return <span>DM</span>;
});

export default Title;
