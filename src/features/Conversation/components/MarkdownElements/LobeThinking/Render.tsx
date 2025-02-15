import { memo } from 'react';

import Thinking from '@/components/Thinking';
import { ARTIFACT_THINKING_TAG } from '@/const/plugin';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { MarkdownElementProps } from '../type';

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const isLobeThinkingClosed = (input: string = '') => {
  const openTag = `<${ARTIFACT_THINKING_TAG}>`;
  const closeTag = `</${ARTIFACT_THINKING_TAG}>`;

  return input.includes(openTag) && input.includes(closeTag);
};

const Render = memo<MarkdownElementProps>(({ children, id }) => {
  const [isGenerating] = useChatStore((s) => {
    const message = chatSelectors.getMessageById(id)(s);
    return [!isLobeThinkingClosed(message?.content)];
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
