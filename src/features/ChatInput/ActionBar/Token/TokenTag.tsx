import { TokenTag, Tooltip } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelTokens } from '@/const/modelTokens';
import { useTokenCount } from '@/hooks/useTokenCount';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { LanguageModel } from '@/types/llm';

const Token = memo(() => {
  const { t } = useTranslation('chat');

  const [input, messageString] = useChatStore((s) => [
    s.inputMessage,
    chatSelectors.chatsMessageString(s),
  ]);

  const [systemRole, model] = useSessionStore((s) => [
    agentSelectors.currentAgentSystemRole(s),
    agentSelectors.currentAgentModel(s) as LanguageModel,
  ]);

  const plugins = useSessionStore(agentSelectors.currentAgentPlugins);

  const toolsString = useToolStore((s) => {
    const pluginSystemRoles = toolSelectors.enabledSystemRoles(plugins)(s);
    const schemaNumber = toolSelectors
      .enabledSchema(plugins)(s)
      .map((i) => JSON.stringify(i))
      .join('');

    return pluginSystemRoles + schemaNumber;
  });

  const inputTokenCount = useTokenCount(input);

  const systemRoleToken = useTokenCount(systemRole);
  const chatsToken = useTokenCount(messageString);
  const toolsToken = useTokenCount(toolsString);

  const totalToken = systemRoleToken + chatsToken + toolsToken;
  return (
    <Tooltip
      placement={'bottom'}
      title={t('tokenDetail', { chatsToken, systemRoleToken, toolsToken })}
    >
      <TokenTag
        maxValue={ModelTokens[model]}
        style={{ marginLeft: 8 }}
        text={{
          overload: t('tokenTag.overload'),
          remained: t('tokenTag.remained'),
          used: t('tokenTag.used'),
        }}
        value={totalToken + inputTokenCount}
      />
    </Tooltip>
  );
});

export default Token;
