import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import ExtraContainer from '../../Extras/ExtraContainer';
import TTS from '../../Extras/TTS';
import Translate from '../../Extras/Translate';

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
