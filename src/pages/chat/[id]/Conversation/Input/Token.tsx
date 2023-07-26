import { TokenTag, Tooltip } from '@lobehub/ui';
import { encode } from 'gpt-tokenizer';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { ModelTokens } from '@/const/modelTokens';
import { agentSelectors, chatSelectors, useSessionStore } from '@/store/session';

const Token = memo<{ input: string }>(({ input }) => {
  const { t } = useTranslation();

  const inputTokenCount = useMemo(() => encode(input).length, [input]);

  const [totalToken, systemRoleToken, chatsToken, model] = useSessionStore(
    (s) => [
      chatSelectors.totalTokenCount(s),
      chatSelectors.systemRoleTokenCount(s),
      chatSelectors.chatsTokenCount(s),
      agentSelectors.currentAgentModel(s),
    ],
    shallow,
  );

  return (
    <Tooltip title={t('tokenDetail', { chatsToken, systemRoleToken })}>
      <TokenTag
        maxValue={ModelTokens[model]}
        text={{ overload: t('overload') }}
        value={totalToken + inputTokenCount}
      />
    </Tooltip>
  );
});

export default Token;
