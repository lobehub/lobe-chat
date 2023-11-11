import { RenderMessageExtra } from '@lobehub/ui';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';

import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const UserMessageExtra: RenderMessageExtra = memo(({ extra, id, content }) => {
  const loading = useSessionStore((s) => s.chatLoadingId === id);

  const showExtra = extra?.translate || extra?.showTTS;
  if (!showExtra) return;

  return (
    <div style={{ marginTop: 8 }}>
      {extra?.showTTS && (
        <ExtraContainer>
          <TTS content={content} id={id} loading={loading} />
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
