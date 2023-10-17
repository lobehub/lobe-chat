import { SiOpenai } from '@icons-pack/react-simple-icons';
import { RenderMessageExtra, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import Translate from './Translate';

export const AssistantMessageExtra: RenderMessageExtra = memo(({ extra, id }) => {
  const model = useSessionStore(agentSelectors.currentAgentModel);

  const showModelTag = extra?.fromModel && model !== extra?.fromModel;
  const hasTranslate = !!extra?.translate;

  const showExtra = showModelTag || hasTranslate;

  const loading = useSessionStore((s) => s.chatLoadingId === id);

  if (!showExtra) return;

  return (
    <Flexbox gap={8} style={{ marginTop: 8 }}>
      {showModelTag && (
        <div>
          <Tag icon={<SiOpenai size={'1em'} />}>{extra?.fromModel as string}</Tag>
        </div>
      )}
      {extra.translate && (
        <div>
          <Divider style={{ margin: '12px 0' }} />
          <Translate id={id} loading={loading} {...extra.translate} />
        </div>
      )}
    </Flexbox>
  );
});
