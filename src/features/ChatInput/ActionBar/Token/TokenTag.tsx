import { TokenTag } from '@lobehub/ui';
import { Popover } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useTokenCount } from '@/hooks/useTokenCount';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import TokenProgress from './TokenProgress';

const Token = memo(() => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  const [input, messageString] = useChatStore((s) => [
    s.inputMessage,
    chatSelectors.chatsMessageString(s),
  ]);

  const [systemRole, model] = useAgentStore((s) => [
    agentSelectors.currentAgentSystemRole(s),
    agentSelectors.currentAgentModel(s) as string,
  ]);

  const maxTokens = useUserStore(modelProviderSelectors.modelMaxToken(model));

  // Tool usage token
  const canUseTool = useUserStore(modelProviderSelectors.isModelEnabledFunctionCall(model));
  const plugins = useAgentStore(agentSelectors.currentAgentPlugins);
  const toolsString = useToolStore((s) => {
    const pluginSystemRoles = toolSelectors.enabledSystemRoles(plugins)(s);
    const schemaNumber = toolSelectors
      .enabledSchema(plugins)(s)
      .map((i) => JSON.stringify(i))
      .join('');

    return pluginSystemRoles + schemaNumber;
  });
  const toolsToken = useTokenCount(canUseTool ? toolsString : '');

  // Chat usage token
  const inputTokenCount = useTokenCount(input);

  const chatsToken = useTokenCount(messageString) + inputTokenCount;

  // SystemRole token
  const systemRoleToken = useTokenCount(systemRole);

  // Total token
  const totalToken = systemRoleToken + toolsToken + chatsToken;
  return (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={12} width={150}>
          <TokenProgress
            data={[
              {
                color: theme.magenta,
                id: 'systemRole',
                title: t('tokenDetails.systemRole'),
                value: systemRoleToken,
              },
              {
                color: theme.geekblue,
                id: 'tools',
                title: t('tokenDetails.tools'),
                value: toolsToken,
              },
              {
                color: theme.gold,
                id: 'chats',
                title: t('tokenDetails.chats'),
                value: chatsToken,
              },
            ]}
            showIcon
          />
          <TokenProgress
            data={[
              {
                color: theme.colorSuccess,
                id: 'used',
                title: t('tokenDetails.used'),
                value: totalToken,
              },
              {
                color: theme.colorFill,
                id: 'rest',
                title: t('tokenDetails.rest'),
                value: maxTokens - totalToken,
              },
            ]}
            showIcon
            showTotal={t('tokenDetails.total')}
          />
        </Flexbox>
      }
      placement={'top'}
      trigger={['hover', 'click']}
    >
      <TokenTag
        displayMode={'used'}
        maxValue={maxTokens}
        style={{ marginLeft: 8 }}
        text={{
          overload: t('tokenTag.overload'),
          remained: t('tokenTag.remained'),
          used: t('tokenTag.used'),
        }}
        value={totalToken}
      />
    </Popover>
  );
});

export default Token;
