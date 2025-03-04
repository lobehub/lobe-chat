import { memo } from 'react';

import Thinking from '@/components/Thinking';
import { ARTIFACT_THINKING_TAG } from '@/const/plugin';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { MarkdownElementProps } from '../type';
import { isTagClosed } from '../utils';

const Render = memo<MarkdownElementProps>(({ children, id }) => {
  const [isGenerating] = useChatStore((s) => {
    const message = chatSelectors.getMessageById(id)(s);
    return [!isTagClosed(ARTIFACT_THINKING_TAG, message?.content)];
  });

  return (
    <Thinking
      content={children as string}
      style={{ width: isGenerating ? '100%' : undefined }}
      thinking={isGenerating}
    />
  );
});

export default Render;
