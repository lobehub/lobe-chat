import { SiOpenai } from '@icons-pack/react-simple-icons';
import { RenderMessageExtra, Tag } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import ExtraContainer from './ExtraContainer';
import TTS from './TTS';
import Translate from './Translate';

export const AssistantMessageExtra: RenderMessageExtra = memo(({ extra, id, content }) => {
  const model = useSessionStore(agentSelectors.currentAgentModel);
  const loading = useSessionStore((s) => s.chatLoadingId === id);

  const showModelTag = extra?.fromModel && model !== extra?.fromModel;
  const showExtra = extra?.showModelTag || extra?.translate || extra?.showTTS;
  if (!showExtra) return;

  return (
    <Flexbox gap={8} style={{ marginTop: 8 }}>
      {showModelTag && (
        <div>
          <Tag icon={<SiOpenai size={'1em'} />}>{extra?.fromModel as string}</Tag>
        </div>
      )}
      <div>
        {extra?.showTTS && (
          <ExtraContainer>
            <TTS content={content} id={id} loading={loading} />
          </ExtraContainer>
        )}
        {extra?.translate && (
          <ExtraContainer>
            <Translate id={id} loading={loading} {...extra?.translate} />
          </ExtraContainer>
        )}
      </div>
    </Flexbox>
  );
});
