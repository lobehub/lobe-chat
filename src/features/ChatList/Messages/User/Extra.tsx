import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ExtraContainer from '@/features/ChatList/components/Extras/ExtraContainer';
import TTS from '@/features/ChatList/components/Extras/TTS';
import Translate from '@/features/ChatList/components/Extras/Translate';
import { useChatStore } from '@/store/chat';
import { messageStateSelectors } from '@/store/chat/selectors';

interface UserMessageExtraProps {
  content: string;
  extra: any;
  id: string;
}
export const UserMessageExtra = memo<UserMessageExtraProps>(({ extra, id, content }) => {
  const loading = useChatStore(messageStateSelectors.isMessageGenerating(id));

  const showTranslate = !!extra?.translate;
  const showTTS = !!extra?.tts;

  const showExtra = showTranslate || showTTS;

  if (!showExtra) return;

  return (
    <Flexbox gap={8} style={{ marginTop: 8 }}>
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
    </Flexbox>
  );
});
