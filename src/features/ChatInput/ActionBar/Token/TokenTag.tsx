import { TokenTag, Tooltip } from '@lobehub/ui';
import { Popover } from 'antd';
import { useTheme } from 'antd-style';
import numeral from 'numeral';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useModelContextWindowTokens } from '@/hooks/useModelContextWindowTokens';
import { useModelSupportToolUse } from '@/hooks/useModelSupportToolUse';
import { useTokenCount } from '@/hooks/useTokenCount';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors, topicSelectors } from '@/store/chat/selectors';
import { useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import TokenProgress from './TokenProgress';

interface TokenTagProps {
  total: string;
}
const Token = memo<TokenTagProps>(({ total: messageString }) => {
  const { t } = useTranslation(['chat', 'components']);
  const theme = useTheme();

  const [input, historySummary] = useChatStore((s) => [
    s.inputMessage,
    topicSelectors.currentActiveTopicSummary(s)?.content || '',
  ]);

  const [systemRole, model, provider] = useAgentStore((s) => {
    return [
      agentSelectors.currentAgentSystemRole(s),
      agentSelectors.currentAgentModel(s) as string,
      agentSelectors.currentAgentModelProvider(s) as string,
      // add these two params to enable the component to re-render
      agentChatConfigSelectors.historyCount(s),
      agentChatConfigSelectors.enableHistoryCount(s),
    ];
  });

  const [historyCount, enableHistoryCount] = useAgentStore((s) => [
    agentChatConfigSelectors.historyCount(s),
    agentChatConfigSelectors.enableHistoryCount(s),
  ]);

  const maxTokens = useModelContextWindowTokens(model, provider);

  // Tool usage token
  const canUseTool = useModelSupportToolUse(model, provider);
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

  const chatsString = useMemo(() => {
    const chats = chatSelectors.mainAIChatsWithHistoryConfig(useChatStore.getState());
    return chats.map(chat => chat.content).join('');
  }, [messageString, historyCount, enableHistoryCount]);

  const chatsToken = useTokenCount(chatsString) + inputTokenCount;

  // SystemRole token
  const systemRoleToken = useTokenCount(systemRole);
  const historySummaryToken = useTokenCount(historySummary);

  // Total token
  const totalToken = systemRoleToken + historySummaryToken + toolsToken + chatsToken;

  const content = (
    <Flexbox gap={12} style={{ minWidth: 200 }}>
      <Flexbox align={'center'} gap={4} horizontal justify={'space-between'} width={'100%'}>
        <div style={{ color: theme.colorTextDescription }}>{t('tokenDetails.title')}</div>
        <Tooltip
          styles={{ root: { maxWidth: 'unset', pointerEvents: 'none' } }}
          title={t('ModelSelect.featureTag.tokens', {
            ns: 'components',
            tokens: numeral(maxTokens).format('0,0'),
          })}
        >
          <Center
            height={20}
            paddingInline={4}
            style={{
              background: theme.colorFillTertiary,
              borderRadius: 4,
              color: theme.colorTextSecondary,
              fontFamily: theme.fontFamilyCode,
              fontSize: 11,
            }}
          >
            TOKEN
          </Center>
        </Tooltip>
      </Flexbox>
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
            color: theme.orange,
            id: 'historySummary',
            title: t('tokenDetails.historySummary'),
            value: historySummaryToken,
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
  );

  return (
    <Popover arrow={false} content={content} placement={'top'} trigger={['hover', 'click']}>
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
