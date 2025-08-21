import { memo, useContext } from 'react';
import { Flexbox } from 'react-layout-kit';

import DMTag from '@/components/DMTag';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';
import { InPortalThreadContext } from '../components/ChatItem/InPortalThreadContext';

import { RenderMessageExtra } from '../types';
import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const UserMessageExtra: RenderMessageExtra = memo<ChatMessage>(({ extra, id, content, targetId }) => {
  const loading = useChatStore(chatSelectors.isMessageGenerating(id));
  const inPortalThread = useContext(InPortalThreadContext);

  const showTranslate = !!extra?.translate;
  const showTTS = !!extra?.tts;
  const isDM = !!targetId && !inPortalThread; // Don't show DM tag in thread panel

  const showExtra = showTranslate || showTTS || isDM;

  if (!showExtra) return;

  return (
    <Flexbox gap={8} style={{ marginTop: 8 }}>
      {isDM && (
        <ExtraContainer>
          <DMTag senderId="user" targetId={targetId} />
        </ExtraContainer>
      )}
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
