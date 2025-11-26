import { memo } from 'react';

import Thinking from '@/components/Thinking';
import { useChatStore } from '@/store/chat';
import { dbMessageSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { MarkdownElementProps } from '../type';

const isThinkingClosed = (input: string = '') => {
  const openTag = `<think>`;
  const closeTag = `</think>`;

  return input.includes(openTag) && input.includes(closeTag);
};

const Render = memo<MarkdownElementProps>(({ children, id }) => {
  const [isGenerating] = useChatStore((s) => {
    const message = dbMessageSelectors.getDbMessageById(id)(s);
    return [!isThinkingClosed(message?.content)];
  });
  const citations = useChatStore((s) => {
    const message = dbMessageSelectors.getDbMessageById(id)(s);
    return message?.search?.citations;
  });

  const transitionMode = useUserStore(userGeneralSettingsSelectors.transitionMode);

  if (!isGenerating && !children) return;

  return (
    <Thinking
      citations={citations}
      content={children as string}
      thinking={isGenerating}
      thinkingAnimated={transitionMode === 'fadeIn' && isGenerating}
    />
  );
});

export default Render;
