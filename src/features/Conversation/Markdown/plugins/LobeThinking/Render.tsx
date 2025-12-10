import { memo } from 'react';

import Thinking from '@/components/Thinking';
import { ARTIFACT_THINKING_TAG } from '@/const/index';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { dataSelectors, useConversationStore } from '../../../store';
import { MarkdownElementProps } from '../type';
import { isTagClosed } from '../utils';

const Render = memo<MarkdownElementProps>(({ children, id }) => {
  const [isGenerating] = useConversationStore((s) => {
    const message = dataSelectors.getDbMessageById(id)(s);
    return [!isTagClosed(ARTIFACT_THINKING_TAG, message?.content)];
  });
  const transitionMode = useUserStore(userGeneralSettingsSelectors.transitionMode);

  return (
    <Thinking
      content={children as string}
      style={{ width: isGenerating ? '100%' : undefined }}
      thinking={isGenerating}
      thinkingAnimated={transitionMode === 'fadeIn' && isGenerating}
    />
  );
});

export default Render;
