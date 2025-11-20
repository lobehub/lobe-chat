import { LOADING_FLAT } from '@lobechat/const';
import { ModelPerformance, ModelUsage } from '@lobechat/types';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { messageStateSelectors } from '@/store/chat/selectors';

import ExtraContainer from '../../../components/Extras/ExtraContainer';
import TTS from '../../../components/Extras/TTS';
import Translate from '../../../components/Extras/Translate';
import Usage from '../../../components/Extras/Usage';

interface AssistantMessageExtraProps {
  content: string;
  extra?: any;
  id: string;
  model?: string;
  performance?: ModelPerformance;
  provider?: string;
  tools?: any[];
  usage?: ModelUsage;
}

export const AssistantMessageExtra = memo<AssistantMessageExtraProps>(
  ({ extra, id, content, performance, usage, tools, provider, model }) => {
    const loading = useChatStore(messageStateSelectors.isMessageGenerating(id));

    return (
      <Flexbox gap={8} style={{ marginTop: !!tools?.length ? 8 : 4 }}>
        {content !== LOADING_FLAT && model && (
          <Usage model={model} performance={performance} provider={provider!} usage={usage} />
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
