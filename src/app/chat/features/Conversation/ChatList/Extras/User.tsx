import { RenderMessageExtra } from '@lobehub/ui';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';

import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const UserMessageExtra: RenderMessageExtra = memo<ChatMessage>(({ extra, id, content }) => {
  const loading = useSessionStore((s) => s.chatLoadingId === id);

  const showExtra = extra?.translate || extra?.tts;
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
