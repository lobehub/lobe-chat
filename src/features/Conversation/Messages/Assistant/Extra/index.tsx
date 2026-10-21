import { LOADING_FLAT } from '@lobechat/const';
import { isRemoteHeterogeneousType } from '@lobechat/heterogeneous-agents';
import { type ModelPerformance, type ModelUsage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import type { AutoRoutingMessageMetadata } from 'model-bank/autoRouting';
import { memo } from 'react';

import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';
import { authSelectors } from '@/store/user/slices/auth/selectors';

import { messageStateSelectors, useConversationStore } from '../../../store';
import AutoRouting from '../../components/Extras/AutoRouting';
import ExtraContainer from '../../components/Extras/ExtraContainer';
import Translate from '../../components/Extras/Translate';
import Usage from '../../components/Extras/Usage';

interface AssistantMessageExtraProps {
  autoRouting?: AutoRoutingMessageMetadata;
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
  ({ autoRouting, extra, id, content, performance, usage, tools, provider, model }) => {
    const loading = useConversationStore(messageStateSelectors.isMessageGenerating(id));
    const isLogin = useUserStore(authSelectors.isLogin);
    const isDevMode = useUserStore((s) => userGeneralSettingsSelectors.config(s).isDevMode);

    // Local CLI hetero agents (claude-code, codex) only report `model` after
    // turn_metadata lands mid-stream, so gating on `!!model` alone would skip
    // showing Usage at all. Remote hetero (openclaw, hermes) never expose a
    // real model id and rely on the brand label fallback in Usage — only those
    // should bypass the model check, otherwise local agents render a lone
    // empty-model ModelIcon while streaming.
    const showUsage =
      isDevMode &&
      content !== LOADING_FLAT &&
      (!!model || (!!provider && isRemoteHeterogeneousType(provider)));
    const showTranslate = isLogin && !!extra?.translate;
    // The tier tag shows for everyone: without it a user cannot tell which real
    // model answered, so "this reply got worse" would be impossible to trace.
    const showAutoRouting = !!autoRouting && content !== LOADING_FLAT && !showUsage;

    if (!showUsage && !showTranslate && !showAutoRouting) return null;

    return (
      <Flexbox gap={8} style={{ marginTop: !!tools?.length ? 8 : 4 }}>
        {showAutoRouting && <AutoRouting routing={autoRouting!} />}
        {showUsage && (
          <Usage model={model!} performance={performance} provider={provider!} usage={usage} />
        )}
        {showTranslate && (
          <ExtraContainer>
            <Translate id={id} loading={loading} {...extra?.translate} />
          </ExtraContainer>
        )}
      </Flexbox>
    );
  },
);
