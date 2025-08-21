import { memo, useContext } from 'react';
import { Flexbox } from 'react-layout-kit';

import DMTag from '@/components/DMTag';
import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';
import { InPortalThreadContext } from '../components/ChatItem/InPortalThreadContext';

import { RenderMessageExtra } from '../types';
import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';
import Usage from './Usage';

export const AssistantMessageExtra: RenderMessageExtra = memo<ChatMessage>(
  ({ extra, id, content, metadata, tools, targetId, agentId }) => {
    const loading = useChatStore(chatSelectors.isMessageGenerating(id));
    const inPortalThread = useContext(InPortalThreadContext);
    const isDM = !!targetId && !inPortalThread; // Don't show DM tag in thread panel

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
          {isDM && (
            // <ExtraContainer>
            <DMTag senderId={agentId} targetId={targetId} />
            // </ExtraContainer>
          )}
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
