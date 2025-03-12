import { memo } from 'react';

import Thinking from '@/components/Thinking';
import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/selectors';

interface ReasoningProps {
  content?: string;
  duration?: number;
  id: string;
}

const Reasoning = memo<ReasoningProps>(({ content = '', duration, id }) => {
  const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

  return <Thinking content={content} duration={duration} thinking={isReasoning} />;
});

export default Reasoning;
