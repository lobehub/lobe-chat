import { SiOpenai } from '@icons-pack/react-simple-icons';
import { Tag } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';

import { RenderMessageExtra } from '../types';
import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const AssistantMessageExtra: RenderMessageExtra = memo<ChatMessage>(
  ({ extra, id, content }) => {
    const model = useSessionStore(agentSelectors.currentAgentModel);
    const loading = useChatStore((s) => s.chatLoadingId === id);

    const showModelTag = extra?.fromModel && model !== extra?.fromModel;
    const showTranslate = !!extra?.translate;
    const showTTS = !!extra?.tts;

    const showExtra = showModelTag || showTranslate || showTTS;

    if (!showExtra) return;

    return (
      <Flexbox gap={8} style={{ marginTop: 8 }}>
        {showModelTag && (
          <div>
            <Tag icon={<SiOpenai size={'1em'} />}>{extra?.fromModel as string}</Tag>
          </div>
        )}
        <>
          {extra?.tts && (
            <ExtraContainer>
              <TTS content={content} id={id} loading={loading} {...extra?.tts} />
            </ExtraContainer>
          )}
          {extra?.translate && (
            <ExtraContainer>
              <Translate id={id} loading={loading} {...extra?.translate} />
            </ExtraContainer>
          )}
        </>
      </Flexbox>
    );
  },
);
