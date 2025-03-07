import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import { RenderMessageExtra } from '../types';
import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';
import Usage from './Usage';

export const AssistantMessageExtra: RenderMessageExtra = memo<ChatMessage>(
  ({ extra, id, content, metadata, tools }) => {
    const loading = useChatStore(chatSelectors.isMessageGenerating(id));

    return (
      <Flexbox gap={8} style={{ marginTop: !!tools?.length ? 8 : 4 }}>
        {content !== LOADING_FLAT && extra?.fromModel && (
          <Usage
            metadata={metadata || {}}
            model={extra?.fromModel}
            provider={extra.fromProvider!}
          />
        )}
        <>
          {!!extra?.tts && (
            <ExtraContainer>
              <TTS content={content} id={id} loading={loading} {...extra?.tts} />
            </ExtraContainer>
          )}
          {!!extra?.translate && (
            <ExtraContainer>
              <Translate id={id} loading={loading} {...extra?.translate} />
            </ExtraContainer>
          )}
        </>
      </Flexbox>
    );
  },
);
