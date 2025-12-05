import { Timer, TimerOff } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors, chatConfigByIdSelectors } from '@/store/agent/selectors';

import { useAgentId } from '../../hooks/useAgentId';
import Action from '../components/Action';
import Controls from './Controls';

const History = memo(() => {
  const agentId = useAgentId();
  const [isLoading, chatConfig, updateAgentChatConfig] = useAgentStore((s) => [
    agentByIdSelectors.isAgentConfigLoadingById(agentId)(s),
    chatConfigByIdSelectors.getChatConfigById(agentId)(s),
    s.updateAgentChatConfig,
  ]);
  const [updating, setUpdating] = useState(false);
  const { t } = useTranslation('setting');
  const isMobile = useIsMobile();

  const [historyCount, enableHistoryCount] = useAgentStore((s) => {
    return [
      chatConfigByIdSelectors.getHistoryCountById(agentId)(s),
      chatConfigByIdSelectors.getEnableHistoryCountById(agentId)(s),
    ];
  });

  if (isLoading) return <Action disabled icon={TimerOff} />;

  const title = t(
    enableHistoryCount
      ? 'settingChat.enableHistoryCount.limited'
      : 'settingChat.enableHistoryCount.unlimited',
    { number: historyCount || 0 },
  );

  return (
    <Action
      icon={enableHistoryCount ? Timer : TimerOff}
      loading={updating}
      onClick={
        isMobile
          ? undefined
          : async (e) => {
              e?.preventDefault?.();
              e?.stopPropagation?.();
              const next = !Boolean(chatConfig.enableHistoryCount);
              await updateAgentChatConfig({ enableHistoryCount: next });
            }
      }
      popover={{
        content: <Controls setUpdating={setUpdating} updating={updating} />,
        minWidth: 240,
        trigger: isMobile ? ['click'] : ['hover'],
      }}
      showTooltip={false}
      title={title}
    />
  );
});

export default History;
