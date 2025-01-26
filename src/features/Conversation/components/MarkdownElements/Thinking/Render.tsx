import { memo } from 'react';

import Thinking from '@/components/Thinking';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { MarkdownElementProps } from '../type';

export const isThinkingClosed = (input: string = '') => {
  const openTag = `<think>`;
  const closeTag = `</think>`;

  return input.includes(openTag) && input.includes(closeTag);
};

const Render = memo<MarkdownElementProps>(({ children, id }) => {
  const [isGenerating] = useChatStore((s) => {
    const message = chatSelectors.getMessageById(id)(s);
    return [!isThinkingClosed(message?.content)];
  });

  return <Thinking content={children} thinking={isGenerating} />;
});

export default Render;
