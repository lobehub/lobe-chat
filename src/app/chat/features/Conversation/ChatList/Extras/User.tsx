import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/chatMessage';

import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const UserMessageExtra = memo<ChatMessage>(({ tts, translate, id, content }) => {
  const loading = useChatStore((s) => s.chatLoadingId === id);

  const showTranslate = !!translate;
  const showTTS = !!tts;

  const showExtra = showTranslate || showTTS;

  if (!showExtra) return;

  return (
    <div style={{ marginTop: 8 }}>
      {tts && (
        <ExtraContainer>
          <TTS content={content} id={id} loading={loading} {...tts} />
        </ExtraContainer>
      )}
      {translate && (
        <ExtraContainer>
          <Translate id={id} {...translate} loading={loading} />
        </ExtraContainer>
      )}
    </div>
  );
});
