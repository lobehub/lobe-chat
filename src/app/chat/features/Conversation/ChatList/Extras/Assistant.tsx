import { SiOpenai } from '@icons-pack/react-simple-icons';
import { Tag } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/chatMessage';

import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const AssistantMessageExtra = memo<ChatMessage>(
  ({ tts, translate, fromModel, id, content }) => {
    const model = useSessionStore(agentSelectors.currentAgentModel);
    const loading = useChatStore((s) => s.chatLoadingId === id);

    const showModelTag = fromModel && model !== fromModel;
    const showTranslate = !!translate;
    const showTTS = !!tts;

    const showExtra = showModelTag || showTranslate || showTTS;

    if (!showExtra) return;

    return (
      <Flexbox gap={8} style={{ marginTop: 8 }}>
        {showModelTag && (
          <div>
            <Tag icon={<SiOpenai size={'1em'} />}>{fromModel as string}</Tag>
          </div>
        )}
        <div>
          {tts && (
            <ExtraContainer>
              <TTS content={content} id={id} loading={loading} {...tts} />
            </ExtraContainer>
          )}
          {translate && (
            <ExtraContainer>
              <Translate id={id} loading={loading} {...translate} />
            </ExtraContainer>
          )}
        </div>
      </Flexbox>
    );
  },
);
