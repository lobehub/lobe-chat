import { memo } from 'react';

import ExtraContainer from '@/features/Conversation/components/Extras/ExtraContainer';
import TTS from '@/features/Conversation/components/Extras/TTS';
import Translate from '@/features/Conversation/components/Extras/Translate';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

interface UserMessageExtraProps {
  content: string;
  extra: any;
  id: string;
}
export const UserMessageExtra = memo<UserMessageExtraProps>(({ extra, id, content }) => {
  const loading = useChatStore(chatSelectors.isMessageGenerating(id));

  const showTranslate = !!extra?.translate;
  const showTTS = !!extra?.tts;

  const showExtra = showTranslate || showTTS;

  if (!showExtra) return;

  return (
    <div style={{ marginTop: 8 }}>
      {extra?.tts && (
        <ExtraContainer>
          <TTS content={content} id={id} loading={loading} {...extra?.tts} />
        </ExtraContainer>
      )}
      {extra?.translate && (
        <ExtraContainer>
          <Translate id={id} {...extra?.translate} loading={loading} />
        </ExtraContainer>
      )}
    </div>
  );
});
