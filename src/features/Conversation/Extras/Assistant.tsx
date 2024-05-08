import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelTag from '@/components/ModelTag';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import { RenderMessageExtra } from '../types';
import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const AssistantMessageExtra: RenderMessageExtra = memo<ChatMessage>(
  ({ extra, id, content }) => {
    const model = useAgentStore(agentSelectors.currentAgentModel);
    const loading = useChatStore(chatSelectors.isMessageGenerating(id));

    const showModelTag = extra?.fromModel && model !== extra?.fromModel;
    const showTranslate = !!extra?.translate;
    const showTTS = !!extra?.tts;

    const showExtra = showModelTag || showTranslate || showTTS;

    if (!showExtra) return;

    return (
      <Flexbox gap={8} style={{ marginTop: 8 }}>
        {showModelTag && (
          <div>
            <ModelTag model={extra?.fromModel as string} />
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
